import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.BadgesEnabled ??= true;

const styles = stylesheet.createThemedStyleSheet({
  versionText: {
    fontSize: 13,
    color: semanticColors.TEXT_MUTED,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "700",
    color: semanticColors.TEXT_MUTED,
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginBottom: 8,
    marginHorizontal: 0,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    gap: 14,
  },
  emojiGroup: { flexDirection: "row", gap: 4 },
  emojiText: { fontSize: 32 },
  title: { flexDirection: "column", gap: 2 },
  name: { fontSize: 26, fontWeight: "800", color: semanticColors.HEADER_PRIMARY },
  author: { fontSize: 13, color: semanticColors.HEADER_SECONDARY },
  previewBox: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    backgroundColor: semanticColors.CARD_PRIMARY_BG,
    borderWidth: 1,
    borderColor: semanticColors.BORDER_FAINT,
    gap: 10,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewName: { fontSize: 14, fontWeight: "700", color: semanticColors.TEXT_NORMAL },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
});

const BADGES = [
    { label: "owner", color: "#E74C3C", bg: "#E74C3C22" },
    { label: "admin", color: "#E67E22", bg: "#E67E2222" },
    { label: "staff", color: "#5865F2", bg: "#5865F222" },
    { label: "mod",   color: "#3BA55D", bg: "#3BA55D22" },
];

function BetterTableRowGroup({ title, children }: React.PropsWithChildren<{ title?: string }>) {
  const groupStyles = stylesheet.createThemedStyleSheet({
    main: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderColor: semanticColors.BORDER_FAINT,
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
  });

  return (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16 }}>
      {title && (
        <RN.View style={styles.titleContainer}>
          <RN.View style={styles.titleLeft}>
            <RN.Text style={styles.titleText}>{title.toUpperCase()}</RN.Text>
          </RN.View>
        </RN.View>
      )}
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
          <Text style={styles.name}>RoleBadges</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
        </View>
      </View>

      {/* Preview */}
      <RN.View style={styles.previewBox}>
        {BADGES.map(b => (
          <RN.View key={b.label} style={styles.previewRow}>
            <RN.Text style={styles.previewName}>Username</RN.Text>
            <RN.View style={[styles.badge, { backgroundColor: b.bg }]}>
              <RN.Text style={[styles.badgeText, { color: b.color }]}>{b.label}</RN.Text>
            </RN.View>
          </RN.View>
        ))}
      </RN.View>

      <BetterTableRowGroup title="General">
        <FormSwitchRow
          label="🏷️ Enable Role Badges"
          subLabel="Shows owner, admin, staff and mod badges next to usernames. Requires restart."
          value={storage.BadgesEnabled}
          onValueChange={(v: boolean) => { storage.BadgesEnabled = v; }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup title="Badge Colors">
        <RN.View style={{ padding: 16, gap: 10 }}>
          {BADGES.map(b => (
            <RN.View key={b.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <RN.Text style={{ color: semanticColors.TEXT_NORMAL, fontSize: 14, fontWeight: "600", textTransform: "capitalize" }}>{b.label}</RN.Text>
              <RN.View style={[styles.badge, { backgroundColor: b.bg }]}>
                <RN.Text style={[styles.badgeText, { color: b.color }]}>{b.label}</RN.Text>
              </RN.View>
            </RN.View>
          ))}
          <RN.Text style={{ fontSize: 11, color: semanticColors.TEXT_MUTED, marginTop: 4 }}>Colors are fixed for consistency.</RN.Text>
        </RN.View>
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
      <RN.Text style={styles.versionText}>RoleBadges v1.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
