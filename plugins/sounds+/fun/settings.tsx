import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text, TextInput, TouchableOpacity } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.StartupSoundEnabled ??= true;
storage.PingSoundEnabled    ??= true;
storage.StartupVolume       ??= 1.0;
storage.PingVolume          ??= 1.0;
storage.CustomStartupURL    ??= "";
storage.CustomPingURL       ??= "";

const VOLUME_STEPS = [0.25, 0.5, 0.75, 1.0];
const VOLUME_LABELS = ["25%", "50%", "75%", "100%"];

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
  emojiGroup: {
    flexDirection: "row",
    gap: 4,
  },
  emojiText: {
    fontSize: 32,
  },
  title: {
    flexDirection: "column",
    gap: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: semanticColors.HEADER_PRIMARY,
  },
  author: {
    fontSize: 13,
    color: semanticColors.HEADER_SECONDARY,
  },
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
  input: {
    color: semanticColors.TEXT_NORMAL,
    fontSize: 13,
  },
  noteText: {
    fontSize: 11,
    color: semanticColors.TEXT_MUTED,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  volumeRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  volumeLabel: {
    fontSize: 14,
    color: semanticColors.TEXT_NORMAL,
    fontWeight: "600",
  },
  volumeButtons: {
    flexDirection: "row",
    gap: 6,
  },
  volBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.BORDER_FAINT,
  },
  volBtnActive: {
    backgroundColor: semanticColors.TEXT_BRAND,
    borderColor: semanticColors.TEXT_BRAND,
  },
  volBtnText: {
    fontSize: 12,
    color: semanticColors.TEXT_MUTED,
    fontWeight: "600",
  },
  volBtnTextActive: {
    color: "#FFFFFF",
  },
});

function VolumeSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <RN.View style={styles.volumeRow}>
      <RN.Text style={styles.volumeLabel}>🔊 Volume</RN.Text>
      <RN.View style={styles.volumeButtons}>
        {VOLUME_STEPS.map((step, i) => {
          const active = Math.abs(value - step) < 0.01;
          return (
            <TouchableOpacity
              key={step}
              style={[styles.volBtn, active && styles.volBtnActive]}
              onPress={() => onChange(step)}
            >
              <RN.Text style={[styles.volBtnText, active && styles.volBtnTextActive]}>
                {VOLUME_LABELS[i]}
              </RN.Text>
            </TouchableOpacity>
          );
        })}
      </RN.View>
    </RN.View>
  );
}

function BetterTableRowGroup({
  title,
  children,
}: React.PropsWithChildren<{ title?: string }>) {
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

      {/* Header */}
      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>🔊</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>Sound+</Text>
          <Text style={styles.author}>by nabi (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)</Text>
        </View>
      </View>

      {/* Startup sound */}
      <BetterTableRowGroup title="Startup Sound">
        <FormSwitchRow
          label="🎵 Play sound on Discord open"
          subLabel="Plays a sound when Discord launches"
          value={storage.StartupSoundEnabled}
          onValueChange={(v: boolean) => { storage.StartupSoundEnabled = v; }}
        />
        <VolumeSelector
          value={storage.StartupVolume}
          onChange={(v) => { storage.StartupVolume = v; }}
        />
      </BetterTableRowGroup>

      <RN.Text style={styles.noteText}>Custom startup sound URL (leave blank for default meow 🐱)</RN.Text>
      <RN.View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/sound.mp3"
          placeholderTextColor={semanticColors.TEXT_MUTED}
          value={storage.CustomStartupURL}
          onChangeText={(v: string) => { storage.CustomStartupURL = v; }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </RN.View>
      <RN.Text style={styles.noteText}>Requires a restart after changing the URL.</RN.Text>

      {/* Ping sound */}
      <BetterTableRowGroup title="Ping Sound">
        <FormSwitchRow
          label="🔔 Play sound on ping"
          subLabel="Plays a sound when you receive a message"
          value={storage.PingSoundEnabled}
          onValueChange={(v: boolean) => { storage.PingSoundEnabled = v; }}
        />
        <VolumeSelector
          value={storage.PingVolume}
          onChange={(v) => { storage.PingVolume = v; }}
        />
      </BetterTableRowGroup>

      <RN.Text style={styles.noteText}>Custom ping sound URL (leave blank for default Discord ping)</RN.Text>
      <RN.View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/ping.mp3"
          placeholderTextColor={semanticColors.TEXT_MUTED}
          value={storage.CustomPingURL}
          onChangeText={(v: string) => { storage.CustomPingURL = v; }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </RN.View>
      <RN.Text style={styles.noteText}>Requires a restart after changing the URL.</RN.Text>

      {/* More */}
      <BetterTableRowGroup title="More">
        <FormRow
          label="Source Code"
          leading={
            <FormRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />
          }
          trailing={<FormRow.Icon source={getAssetIDByName("ic_launch")} />}
          onPress={() => RN.Linking.openURL("https://github.com/N-bi/kettu-plugins-2")}
        />
      </BetterTableRowGroup>

      <RN.View style={{ height: 20 }} />
      <RN.Text style={styles.versionText}>SoundFX v1.0.1</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
