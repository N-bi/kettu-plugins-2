import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text, TextInput } = RN;
const { FormRow, FormSwitchRow } = Forms;

storage.ParticleStars   ??= true;
storage.ParticleLeaves  ??= true;
storage.ParticleRain    ??= false;
storage.ParticleSun     ??= false;
storage.ModeChristmas   ??= false;
storage.ModeHalloween   ??= false;
storage.ModeCustom      ??= false;
storage.CustomImageURL  ??= "";
storage.SnowPerformance ??= false;

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
    gap: 4,
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
  warningBox: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#F39C1220",
    borderColor: "#F39C12",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    fontSize: 12,
    color: "#F39C12",
    fontWeight: "600",
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
  },
});

function BetterTableRowGroup({
  title,
  icon,
  children,
  padding = false,
  action,
}: React.PropsWithChildren<{
  title?: string;
  icon?: number;
  padding?: boolean;
  action?: React.ReactNode;
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
    icon: {
      width: 16,
      height: 16,
      marginTop: 1.5,
      tintColor: semanticColors.TEXT_MUTED,
    },
  });

  return (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16 }}>
      {title && (
        <RN.View style={styles.titleContainer}>
          <RN.View style={styles.titleLeft}>
            {icon && (
              <RN.Image
                style={groupStyles.icon}
                source={icon}
                resizeMode="cover"
              />
            )}
            <RN.Text style={styles.titleText}>{title.toUpperCase()}</RN.Text>
          </RN.View>
          {action}
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>

      {/* Header */}
      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>★</Text>
          <Text style={styles.emojiText}>🍂</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>Let it Fall</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
        </View>
      </View>

      {/* Regular particles */}
      <BetterTableRowGroup title="Particles">
        <FormSwitchRow
          label="⭐ Stars"
          subLabel="Slowly drifting glowing stars"
          value={storage.ParticleStars}
          onValueChange={(v: boolean) => { storage.ParticleStars = v; }}
        />
        <FormSwitchRow
          label="🍂 Leaves"
          subLabel="Autumn leaves swaying as they fall"
          value={storage.ParticleLeaves}
          onValueChange={(v: boolean) => { storage.ParticleLeaves = v; }}
        />
        <FormSwitchRow
          label="💧 Rain"
          subLabel="Light rain drops falling down"
          value={storage.ParticleRain}
          onValueChange={(v: boolean) => { storage.ParticleRain = v; }}
        />
        <FormSwitchRow
          label="☀️ Sun"
          subLabel="Floating suns drifting across the screen"
          value={storage.ParticleSun}
          onValueChange={(v: boolean) => { storage.ParticleSun = v; }}
        />
      </BetterTableRowGroup>

      {/* special area */}
      <BetterTableRowGroup title="Special">
        <FormSwitchRow
          label="🎄 Christmas"
          subLabel="Snow, snowflakes, snowmen and more. Overrides particles above."
          value={storage.ModeChristmas}
          onValueChange={(v: boolean) => {
            storage.ModeChristmas = v;
            if (v) { storage.ModeHalloween = false; storage.ModeCustom = false; }
          }}
        />
        <FormSwitchRow
          label="🎃 Halloween"
          subLabel="Pumpkins, candy, webs and candles. Overrides particles above."
          value={storage.ModeHalloween}
          onValueChange={(v: boolean) => {
            storage.ModeHalloween = v;
            if (v) { storage.ModeChristmas = false; storage.ModeCustom = false; }
          }}
        />
        <FormSwitchRow
          label="🖼️ Custom Image  [TEST]"
          subLabel="Use your own image via a direct link. Experimental — may not work on all devices."
          value={storage.ModeCustom}
          onValueChange={(v: boolean) => {
            storage.ModeCustom = v;
            if (v) { storage.ModeChristmas = false; storage.ModeHalloween = false; }
          }}
        />
      </BetterTableRowGroup>

      {/* Custom image URL input section */}
      {storage.ModeCustom && (
        <>
          <RN.View style={styles.warningBox}>
            <RN.Text style={styles.warningText}>⚠️ TEST FEATURE — Custom images may cause lag or fail to load depending on the image host and your connection. Use a direct image URL ending in .png or .gif</RN.Text>
          </RN.View>
          <RN.View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.png"
              placeholderTextColor={semanticColors.TEXT_MUTED}
              value={storage.CustomImageURL}
              onChangeText={(v: string) => { storage.CustomImageURL = v; }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </RN.View>
          <RN.Text style={styles.noteText}>Requires a restart after changing the URL.</RN.Text>
        </>
      )}

      {/* Settings */}
      <BetterTableRowGroup title="Settings">
        <FormSwitchRow
          label="Performance Mode"
          subLabel="Reduces particle count and disables animations. Requires restart."
          value={storage.SnowPerformance}
          onValueChange={(v: boolean) => { storage.SnowPerformance = v; }}
        />
      </BetterTableRowGroup>

      {/* Links */}
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
      <RN.Text style={styles.versionText}>Let it Fall v2.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
                          }

