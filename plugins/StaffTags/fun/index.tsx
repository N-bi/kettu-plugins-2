import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import settings from "./settings.js";

storage.BadgesEnabled ??= true;

let patches = [];

// ── Badge config ───────────────────────────────────────────────────────────
const BADGE_CONFIG = {
    owner:  { label: "owner",  color: "#E74C3C", bg: "#E74C3C22" },
    admin:  { label: "admin",  color: "#E67E22", bg: "#E67E2222" },
    staff:  { label: "staff",  color: "#5865F2", bg: "#5865F222" },
    mod:    { label: "mod",    color: "#3BA55D", bg: "#3BA55D22" },
};

const ROLE_KEYWORDS = {
    owner: ["owner"],
    admin: ["admin", "administrator"],
    staff: ["staff"],
    mod:   ["mod", "moderator"],
};

function getBadgeForMember(member, guild) {
    if (!member || !guild) return null;

    // Check if server owner
    if (guild.ownerId === member.userId) return BADGE_CONFIG.owner;

    const roleIds = member.roles ?? [];
    const guildRoles = guild.roles ?? {};

    for (const roleId of roleIds) {
        const role = guildRoles[roleId];
        if (!role?.name) continue;
        const name = role.name.toLowerCase();

        for (const [type, keywords] of Object.entries(ROLE_KEYWORDS)) {
            if (keywords.some(k => name.includes(k))) {
                return BADGE_CONFIG[type];
            }
        }
    }

    return null;
}

const { Text, View } = ReactNative;

function RoleBadge({ badge }) {
    if (!badge) return null;
    return React.createElement(View, {
        style: {
            backgroundColor: badge.bg,
            borderRadius: 4,
            paddingHorizontal: 5,
            paddingVertical: 1,
            marginLeft: 5,
            alignSelf: "center",
        }
    }, React.createElement(Text, {
        style: {
            color: badge.color,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.3,
        }
    }, badge.label));
}

export default {
    onLoad: () => {
        if (!storage.BadgesEnabled) return;

        try {
            const GuildStore    = findByProps("getGuild", "getGuilds");
            const GuildMemberStore = findByProps("getMember", "getMembers");

            // ── Patch message username row ─────────────────────────────────
            const MessageUsername = findByProps("renderUsername")
                ?? findByProps("UsernameWithContext")
                ?? findByProps("MessageAuthor");

            if (MessageUsername) {
                const key = Object.keys(MessageUsername).find(k =>
                    typeof MessageUsername[k] === "function" &&
                    (k.includes("Username") || k.includes("Author") || k.includes("render"))
                );

                if (key) {
                    patches.push(
                        before(key, MessageUsername, (args) => {
                            const props = args[0];
                            if (!props?.message) return;
                            const { guildId, author } = props.message;
                            if (!guildId) return;
                            const guild  = GuildStore?.getGuild?.(guildId);
                            const member = GuildMemberStore?.getMember?.(guildId, author?.id);
                            const badge  = getBadgeForMember(member, guild);
                            if (badge) props.__roleBadge = badge;
                        })
                    );
                }
            }

            // ── Patch member list row ──────────────────────────────────────
            const MemberListItem = findByProps("MemberListItem")
                ?? findByProps("renderMemberListItem")
                ?? findByProps("getMemberListItem");

            if (MemberListItem) {
                const comp = MemberListItem.default ?? MemberListItem.MemberListItem;
                if (comp?.prototype?.render) {
                    patches.push(
                        before("render", comp.prototype, function() {
                            const { guildId, user } = this.props ?? {};
                            if (!guildId || !user) return;
                            const guild  = GuildStore?.getGuild?.(guildId);
                            const member = GuildMemberStore?.getMember?.(guildId, user.id);
                            const badge  = getBadgeForMember(member, guild);
                            if (badge) this.props.__roleBadge = badge;
                        })
                    );
                }
            }

            // ── Patch the General.View render to inject badges ─────────────
            // This catches username rows which usually have accessibilityLabel
            const { General } = require("@vendetta/ui/components");
            patches.push(
                before("render", General.View, (args) => {
                    const [props] = args;
                    if (!props?.__roleBadge) return;
                    const badge = props.__roleBadge;

                    const orig = props.children;
                    props.children = [
                        orig,
                        React.createElement(RoleBadge, { badge, key: "role-badge" })
                    ];
                    delete props.__roleBadge;
                })
            );

        } catch (e) {
            console.log("[RoleBadges] Error:", e);
        }
    },

    onUnload: () => {
        for (const x of patches) x();
    },

    settings,
};
