import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByName, findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import settings from "./settings.js";

// ── Defaults ───────────────────────────────────────────────────────────────
storage.BubbleEnabled    ??= true;
storage.MyBubbleColor    ??= "#5865F220";
storage.OtherBubbleColor ??= "#FFFFFF10";
storage.BubbleRadius     ??= 12;

let patches = [];

function hexToRgba(hex: string, fallback: string): string {
    try {
        // Support #RRGGBB and #RRGGBBAA
        const clean = hex.replace("#", "");
        if (clean.length === 6) {
            const r = parseInt(clean.slice(0, 2), 16);
            const g = parseInt(clean.slice(2, 4), 16);
            const b = parseInt(clean.slice(4, 6), 16);
            return `rgba(${r},${g},${b},0.15)`;
        } else if (clean.length === 8) {
            const r = parseInt(clean.slice(0, 2), 16);
            const g = parseInt(clean.slice(2, 4), 16);
            const b = parseInt(clean.slice(4, 6), 16);
            const a = parseInt(clean.slice(6, 8), 16) / 255;
            return `rgba(${r},${g},${b},${a.toFixed(2)})`;
        }
        return fallback;
    } catch {
        return fallback;
    }
}

export default {
    onLoad: () => {
        if (!storage.BubbleEnabled) return;

        try {
            const UserStore = findByProps("getCurrentUser");
            const MessageRecord = findByName("MessageRecord", false);

            // Patch the message component
            const ChatMessage = findByName("ChatMessage", false)
                ?? findByProps("renderMessage")
                ?? findByName("Message", false);

            if (!ChatMessage) {
                console.log("[ChatBubbles] Could not find message component");
                return;
            }

            const target = ChatMessage.default ?? ChatMessage;

            patches.push(
                before("render", target.prototype ?? target, (args) => {
                    // nothing to patch here, we patch the output
                }),
            );

            // Better approach: patch the message container view
            const { View } = ReactNative;

            const MessageComponent = findByProps("MessagesWrapperConnected")
                ?? findByProps("renderMessageContent");

            // Patch at the row level
            const ChatMessageWrapper = findByName("ChatMessageWrapper", false)
                ?? findByName("BaseMessage", false)
                ?? findByProps("renderSystemMessage");

            if (ChatMessageWrapper) {
                const comp = ChatMessageWrapper.default ?? ChatMessageWrapper;
                if (comp?.prototype?.render) {
                    patches.push(
                        before("render", comp.prototype, function(args) {
                            const currentUser = UserStore?.getCurrentUser?.();
                            const isMe = this?.props?.message?.author?.id === currentUser?.id;
                            const color = isMe
                                ? (storage.MyBubbleColor || "#5865F220")
                                : (storage.OtherBubbleColor || "#FFFFFF10");
                            const radius = storage.BubbleRadius ?? 12;

                            const origRender = comp.prototype.render.bind(this);
                            const result = origRender();
                            if (!result) return;

                            result.props = result.props ?? {};
                            result.props.style = [
                                result.props.style,
                                {
                                    backgroundColor: color,
                                    borderRadius: radius,
                                    marginHorizontal: 8,
                                    marginVertical: 1,
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                }
                            ];
                        })
                    );
                }
            }

        } catch (e) {
            console.log("[ChatBubbles] Error:", e);
        }
    },

    onUnload: () => {
        for (const x of patches) x();
    },

    settings,
};
