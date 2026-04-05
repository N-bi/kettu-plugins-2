import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.useRoleColor ??= false;

const styles = stylesheet.createThemedStyleSheet({
  versionText: { fontSize: 13, color: semanticColors.TEXT_MUTED, textAlign: "center", fontWeight: "500", lineHeight: 20 },
  titleText: { fontSize: 13, fontWeight: "700", color: semanticColors.TEXT_MUTED, letterSpacing: 0.5 },
  titleContainer: { marginBottom: 8, marginHorizontal: 0, marginTop: 8, flexDirection: "row", alignItems: "center" },
  container: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 24, gap: 14 },
  emojiGroup: { flexDirection: "row", gap: 4 },
  emojiText: { fontSize: 32 },
  title: { flexDirection: "column", gap: 2 },
  name: { fontSize: 26, fontWeight: "800", color: semanticColors.HEADER_PRIMARY },
  author: { fontSize: 13, color: semanticColors.HEADER_SECONDARY },
  previewBox: { marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 16, backgroundColor: semanticColors.CARD_PRIMARY_BG, borderWidth: 1, borderColor: semanticColors.BORDER_FAINT, gap: 10 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewName: { fontSize: 14, fontWeight: "700", color: semanticColors.TEXT_NORMAL },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, color: "#fff" },
});

const BADGES = [
    { label: "OWNER", bg: "#E74C3C" },
    { label: "ADMIN", bg: "#E67E22" },
    { label: "STAFF", bg: "#5865F2" },
    { label: "MOD", bg: "#3BA55D" },
    { label: "VC Mod", bg: "#059669" },
    { label: "Chat Mod", bg: "#7C3AED" },
    { label: "developer", bg: "#E91E8C" },
];

function BetterTableRowGroup({ title, children }: React.PropsWithChildren<{ title?: string }>) {
  const groupStyles = stylesheet.createThemedStyleSheet({
    main: { backgroundColor: semanticColors.CARD_PRIMARY_BG, borderColor: semanticColors.BORDER_FAINT, borderWidth: 1, borderRadius: 16, overflow: "hidden", flex: 1 },
  });
  return (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16 }}>
      {title && <RN.View style={styles.titleContainer}><RN.Text style={styles.titleText}>{title.toUpperCase()}</RN.Text></RN.View>}
      <RN.View style={groupStyles.main}>{children}</RN.View>
    </RN.View>
  );
}

export default function Settings() {
  useProxy(storage);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>🏷️</Text>
          <Text style={styles.emojiText}>👑</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>StaffBadges</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
        </View>
      </View>
      <RN.View style={styles.previewBox}>
        {BADGES.map(b => (
          <RN.View key={b.label} style={styles.previewRow}>
            <RN.Text style={styles.previewName}>Username</RN.Text>
            <RN.View style={[styles.badge, { backgroundColor: b.bg }]}>
              <RN.Text style={styles.badgeText}>{b.label}</RN.Text>
            </RN.View>
          </RN.View>
        ))}
      </RN.View>
      <BetterTableRowGroup title="Options">
        <FormSwitchRow
          label="Use role color for badge"
          subLabel="Uses the user's highest role color instead of the default badge color."
          value={storage.useRoleColor}
          onValueChange={(v: boolean) => { storage.useRoleColor = v; }}
        />
      </BetterTableRowGroup>
      <BetterTableRowGroup title="More">
        <FormRow
          label="Source Code"
          leading={<FormRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />}
          trailing={<FormRow.Icon source={getAssetIDByName("ic_launch")} />}
          onPress={() => RN.Linking.openURL("https://github.com/N-bi/kettu-plugins-2")}
        />
      </BetterTableRowGroup>
      <RN.View style={{ height: 20 }} />
      <RN.Text style={styles.versionText}>StaffBadges v1.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
