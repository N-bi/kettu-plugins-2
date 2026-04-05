import { findByProps, findByStoreName } from "@vendetta/metro";
import { chroma, constants, i18n } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { rawColors } from "@vendetta/ui";

const { Permissions } = constants;
const { computePermissions } = findByProps("computePermissions", "canEveryoneRole");
const GuildMemberStore = findByStoreName("GuildMemberStore");

export const BUILT_IN_TAGS = [
    i18n.Messages.AI_TAG,
    i18n.Messages.BOT_TAG_BOT,
    i18n.Messages.BOT_TAG_SERVER,
    i18n.Messages.SYSTEM_DM_TAG_SYSTEM,
    i18n.Messages.GUILD_AUTOMOD_USER_BADGE_TEXT,
    i18n.Messages.REMIXING_TAG
];

const CUSTOM_BADGES = {
    "1410396006725713982": { text: "developer", backgroundColor: "#E91E8C" },
};

const tags = [
    { text: "WEBHOOK", condition: (guild, channel, user) => user.isNonUserBot() },
    { text: "OWNER", condition: (guild, channel, user) => guild?.ownerId === user.id },
    { text: "ADMIN", permissions: ["ADMINISTRATOR"] },
    { text: "STAFF", permissions: ["MANAGE_GUILD", "MANAGE_CHANNELS", "MANAGE_ROLES", "MANAGE_WEBHOOKS"] },
    { text: "MOD", permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS"] },
    { text: "VC Mod", permissions: ["MOVE_MEMBERS", "MUTE_MEMBERS", "DEAFEN_MEMBERS"] },
    { text: "Chat Mod", permissions: ["MODERATE_MEMBERS"] }
];

export default function getTag(guild, channel, user) {
    const customBadge = CUSTOM_BADGES[user.id];
    if (customBadge) {
        const bg = customBadge.backgroundColor ?? rawColors.BRAND_500;
        const textColor = chroma(bg).get('lab.l') < 70 ? rawColors.WHITE_500 : rawColors.BLACK_500;
        return { text: customBadge.text, textColor, backgroundColor: bg, verified: false };
    }

    let permissions;
    if (guild) {
        const permissionsInt = computePermissions({
            user, context: guild, overwrites: channel?.permissionOverwrites
        });
        permissions = Object.entries(Permissions)
            .map(([perm, permInt]: [string, bigint]) => permissionsInt & permInt ? perm : "")
            .filter(Boolean);
    }

    for (const tag of tags) {
        if ((tag as any).condition?.(guild, channel, user) ||
            (!user.bot && (tag as any).permissions?.some(perm => permissions?.includes(perm)))) {
            const roleColor = storage.useRoleColor
                ? GuildMemberStore.getMember(guild?.id, user.id)?.colorString
                : undefined;
            const backgroundColor = roleColor ?? (tag as any).backgroundColor ?? rawColors.BRAND_500;
            const textColor = (roleColor || !(tag as any).textColor)
                ? (chroma(backgroundColor).get('lab.l') < 70 ? rawColors.WHITE_500 : rawColors.BLACK_500)
                : (tag as any).textColor;
            return { ...tag, textColor, backgroundColor, verified: false, condition: undefined, permissions: undefined };
        }
    }
}
