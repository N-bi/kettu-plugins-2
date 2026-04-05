import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text, TextInput, TouchableOpacity } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.BubbleEnabled    ??= true;
storage.MyBubbleColor    ??= "#5865F2";
storage.OtherBubbleColor ??= "#FFFFFF";
storage.BubbleRadius     ??= 12;

const RADIUS_OPTIONS = [
  { label: "None", value: 0 },
  { label: "Slight", value: 12 },
  { label: "Medium", value: 18 },
  { label: "Round", value: 24 },
];

const PRESET_COLORS = ["#5865F2", "#3ba55d", "#E67E22", "#E74C3C", "#9B59B6", "#FFFFFF", "#000000"];

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
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
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
  sectionPad: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: semanticColors.TEXT_NORMAL, marginBottom: 8 },
  sectionSub: { fontSize: 11, color: semanticColors.TEXT_MUTED, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: { borderColor: semanticColors.TEXT_BRAND },
  inputBox: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: semanticColors.CARD_PRIMARY_BG,
    borderColor: semanticColors.BORDER_FAINT,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { color: semanticColors.TEXT_NORMAL, fontSize: 13 },
  noteText: { fontSize: 11, color: semanticColors.TEXT_MUTED, marginHorizontal: 16, marginTop: 4 },
  radiusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.BORDER_FAINT,
  },
  radiusBtnActive: { backgroundColor: semanticColors.TEXT_BRAND, borderColor: semanticColors.TEXT_BRAND },
  radiusBtnText: { fontSize: 12, color: semanticColors.TEXT_MUTED, fontWeight: "600" },
  radiusBtnTextActive: { color: "#FFFFFF" },
  previewBox: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    backgroundColor: semanticColors.CARD_PRIMARY_BG,
    borderWidth: 1,
    borderColor: semanticColors.BORDER_FAINT,
  },
  previewMsg: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 3,
    alignSelf: "flex-start" as const,
  },
  previewText: { fontSize: 13, color: semanticColors.TEXT_NORMAL },
});

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

function ColorPicker({ label, sub, value, onChange }: { label: string; sub: string; value: string; onChange: (v: string) => void }) {
  return (
    <RN.View style={styles.sectionPad}>
      <RN.Text style={styles.sectionLabel}>{label}</RN.Text>
      <RN.Text style={styles.sectionSub}>{sub}</RN.Text>
      <RN.View style={styles.row}>
        {PRESET_COLORS.map(c => (
          <TouchableOpacity key={c} onPress={() => onChange(c)}>
            <RN.View style={[styles.colorDot, { backgroundColor: c }, value === c && styles.colorDotActive]} />
          </TouchableOpacity>
        ))}
      </RN.View>
    </RN.View>
  );
}

export default function Settings() {
  useProxy(storage);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>

      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>💬</Text>
          <Text style={styles.emojiText}>🫧</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>ChatBubbles</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
        </View>
      </View>

      {/* Preview */}
      <RN.View style={styles.previewBox}>
        <RN.View style={[styles.previewMsg, { backgroundColor: storage.MyBubbleColor + "33", borderRadius: storage.BubbleRadius }]}>
          <RN.Text style={styles.previewText}>hey this is my message 👋</RN.Text>
        </RN.View>
        <RN.View style={[styles.previewMsg, { backgroundColor: storage.OtherBubbleColor + "33", borderRadius: storage.BubbleRadius }]}>
          <RN.Text style={styles.previewText}>and this is someone else</RN.Text>
        </RN.View>
      </RN.View>

      {/* Toggle */}
      <BetterTableRowGroup title="General">
        <FormSwitchRow
          label="💬 Enable Chat Bubbles"
          subLabel="Adds colored bubbles behind messages. Requires restart."
          value={storage.BubbleEnabled}
          onValueChange={(v: boolean) => { storage.BubbleEnabled = v; }}
        />
      </BetterTableRowGroup>

      {/* My bubble color */}
      <BetterTableRowGroup title="My Messages">
        <ColorPicker
          label="Bubble Color"
          sub="Color for your own messages"
          value={storage.MyBubbleColor}
          onChange={(v) => { storage.MyBubbleColor = v; }}
        />
      </BetterTableRowGroup>

      {/* Others bubble color */}
      <BetterTableRowGroup title="Others' Messages">
        <ColorPicker
          label="Bubble Color"
          sub="Color for other people's messages"
          value={storage.OtherBubbleColor}
          onChange={(v) => { storage.OtherBubbleColor = v; }}
        />
      </BetterTableRowGroup>

      {/* Border radius */}
      <BetterTableRowGroup title="Shape">
        <RN.View style={styles.sectionPad}>
          <RN.Text style={styles.sectionLabel}>Border Radius</RN.Text>
          <RN.View style={styles.row}>
            {RADIUS_OPTIONS.map(opt => {
              const active = storage.BubbleRadius === opt.value;
              return (
                <TouchableOpacity key={opt.value} style={[styles.radiusBtn, active && styles.radiusBtnActive]} onPress={() => { storage.BubbleRadius = opt.value; }}>
                  <RN.Text style={[styles.radiusBtnText, active && styles.radiusBtnTextActive]}>{opt.label}</RN.Text>
                </TouchableOpacity>
              );
            })}
          </RN.View>
        </RN.View>
      </BetterTableRowGroup>

      {/* More */}
      <BetterTableRowGroup title="More">
        <FormRow
          label="Source Code"
          leading={<FormRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />}
          trailing={<FormRow.Icon source={getAssetIDByName("ic_launch")} />}
          onPress={() => RN.Linking.openURL("https://github.com/N-bi/kettu-plugins-2")}
        />
      </BetterTableRowGroup>

      <RN.View style={{ height: 20 }} />
      <RN.Text style={styles.versionText}>ChatBubbles v1.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
