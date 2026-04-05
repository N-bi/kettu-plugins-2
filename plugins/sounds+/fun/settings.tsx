import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text, TextInput, Slider } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.StartupSoundEnabled ??= true;
storage.PingSoundEnabled    ??= true;
storage.StartupVolume       ??= 1.0;
storage.PingVolume          ??= 1.0;
storage.CustomStartupURL    ??= "";
storage.CustomPingURL       ??= "";

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
  sliderRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sliderLabel: {
    fontSize: 13,
    color: semanticColors.TEXT_NORMAL,
    marginBottom: 6,
    fontWeight: "600",
  },
  sliderSub: {
    fontSize: 11,
    color: semanticColors.TEXT_MUTED,
    marginTop: 2,
  },
});

function BetterTableRowGroup({
  title,
  children,
  padding = false,
}: React.PropsWithChildren<{
  title?: string;
  padding?: boolean;
}>) {
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
      <RN.View style={groupStyles.main}>
        {padding ? (
          <RN.View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {children}
          </RN.View>
        ) : (
          children
        )}
      </RN.View>
    </RN.View>
  );
}

export default function Settings() {
  useProxy(storage);
  const [startupVol, setStartupVol] = React.useState(storage.StartupVolume ?? 1.0);
  const [pingVol, setPingVol]       = React.useState(storage.PingVolume ?? 1.0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>

      {/* Header */}
      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>🔊</Text>
          <Text style={styles.emojiText}>🎵</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>SoundFX</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
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
        <RN.View style={styles.sliderRow}>
          <RN.Text style={styles.sliderLabel}>Volume — {Math.round(startupVol * 100)}%</RN.Text>
          <Slider
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={startupVol}
            onValueChange={(v: number) => setStartupVol(v)}
            onSlidingComplete={(v: number) => { storage.StartupVolume = v; }}
            minimumTrackTintColor={semanticColors.TEXT_BRAND}
            maximumTrackTintColor={semanticColors.BORDER_FAINT}
          />
        </RN.View>
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
        <RN.View style={styles.sliderRow}>
          <RN.Text style={styles.sliderLabel}>Volume — {Math.round(pingVol * 100)}%</RN.Text>
          <Slider
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={pingVol}
            onValueChange={(v: number) => setPingVol(v)}
            onSlidingComplete={(v: number) => { storage.PingVolume = v; }}
            minimumTrackTintColor={semanticColors.TEXT_BRAND}
            maximumTrackTintColor={semanticColors.BORDER_FAINT}
          />
        </RN.View>
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
      <RN.Text style={styles.versionText}>SoundFX v1.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
