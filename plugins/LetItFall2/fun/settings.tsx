import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text, TextInput } = RN;
const { FormRow, FormSwitchRow } = Forms;

// default settings (should keep leaves/stars true since both are the defult)
storage.particleStars   ??= true;
storage.particleLeaves  ??= true;
storage.particleRain    ??= false;
storage.particleSun     ??= false;
storage.modeChristmas   ??= false;
storage.modeHalloween   ??= false;
storage.modeCustom      ??= false;
storage.customImageURL  ??= "";
storage.snowPerformance ??= false;

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
    backgroundColor: "#f39c1220", // hex changed for better look
    borderColor: "#f39c12",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    fontSize: 12,
    color: "#f39c12",
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

// custom wrapper to keep everything clean ;p
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

// exporting the main default settings
export default function Settings() {
  // hook to change UI when the storage is updated (hopefully this works)
  useProxy(storage);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>

      {/* the header for main info about the plugin*/}
      <View style={styles.container}>
        <View style={styles.emojiGroup}>
          <Text style={styles.emojiText}>★</Text>
          <Text style={styles.emojiText}>🍂</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>let it fall</Text>
          <Text style={styles.author}>by xc_aux/nabi ✨</Text>
        </View>
      </View>

      {/* particals toggle */}
      <BetterTableRowGroup title="particles">
        <FormSwitchRow
          label="⭐ stars"
          subLabel="slowly drifting glowing stars"
          value={storage.particleStars}
          onValueChange={(v: boolean) => { storage.particleStars = v; }}
        />
        <FormSwitchRow
          label="🍂 leaves"
          subLabel="autumn leaves swaying as they fall"
          value={storage.particleLeaves}
          onValueChange={(v: boolean) => { storage.particleLeaves = v; }}
        />
        <FormSwitchRow
          label="💧 rain"
          subLabel="light rain drops falling down"
          value={storage.particleRain}
          onValueChange={(v: boolean) => { storage.particleRain = v; }}
        />
        <FormSwitchRow
          label="☀️ sun"
          subLabel="floating suns drifting across the screen"
          value={storage.particleSun}
          onValueChange={(v: boolean) => { storage.particleSun = v; }}
        />
      </BetterTableRowGroup>

      {/* seasons/events defining */}
      <BetterTableRowGroup title="special">
        <FormSwitchRow
          label="🎄 christmas"
          subLabel="snow, snowflakes and more, overrides standard particles."
          value={storage.modeChristmas}
          onValueChange={(v: boolean) => {
            storage.modeChristmas = v;
            // enabling the seasonal/event in their specific date
            if (v) { storage.modeHalloween = false; storage.modeCustom = false; }
          }}
        />
        <FormSwitchRow
          label="🎃 halloween"
          subLabel="pumpkins, candy and webs, overrides standard particles."
          value={storage.modeHalloween}
          onValueChange={(v: boolean) => {
            storage.modeHalloween = v;
            if (v) { storage.modeChristmas = false; storage.modeCustom = false; }
          }}
        />
        <FormSwitchRow
          label="🖼️ custom image [test]"
          subLabel="use your own image via direct link, this thing is laggy as hell."
          value={storage.modeCustom}
          onValueChange={(v: boolean) => {
            storage.modeCustom = v;
            if (v) { storage.modeChristmas = false; storage.modeHalloween = false; }
          }}
        />
      </BetterTableRowGroup>

      {/* insurance the fuckass uses .png/.gif */}
      {storage.modeCustom && (
        <>
          <RN.View style={styles.warningBox}>
            <RN.Text style={styles.warningText}>⚠️ this thing is laggy, u can use .gif or .png, still, its pretty much laggy</RN.Text>
          </RN.View>
          <RN.View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.png"
              placeholderTextColor={semanticColors.TEXT_MUTED}
              value={storage.customImageURL}
              onChangeText={(v: string) => { storage.customImageURL = v; }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </RN.View>
          <RN.Text style={styles.noteText}>requires a restart to apply changes.</RN.Text>
        </>
      )}

      {/* performance settings- pretty much useless */}
      <BetterTableRowGroup title="settings">
        <FormSwitchRow
          label="performance mode"
          subLabel="reduces particle count for smoother frames. requires restart."
          value={storage.snowPerformance}
          onValueChange={(v: boolean) => { storage.snowPerformance = v; }}
        />
      </BetterTableRowGroup>

      {/* this labels the social section */}
      <BetterTableRowGroup title="more">
        <FormRow
          label="source code"
          leading={
            <FormRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />
          }
          trailing={<FormRow.Icon source={getAssetIDByName("ic_launch")} />}
          onPress={() => RN.Linking.openURL("https://n-bi.github.io/kettu-plugins-2")}
        />
      </BetterTableRowGroup>

      {/* footer */}
      <RN.View style={{ height: 20 }} />
      <RN.Text style={styles.versionText}>let it fall v2.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
