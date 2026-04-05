import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { ScrollView, View, Text } = RN;
const { FormRow, FormSwitchRow } = Forms;

// Default settings
storage.ParticleStars ??= true;
storage.ParticleLeaves ??= true;
storage.PerformanceMode ??= false;

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
          <Text style={styles.name}>Stardrift</Text>
          <Text style={styles.author}>by you ✨</Text>
        </View>
      </View>

      {/* Particle toggles */}
      <BetterTableRowGroup title="Particles">
        <FormSwitchRow
          label="Show Stars"
          subLabel="Slowly drifting glowing stars"
          value={storage.ParticleStars}
          onValueChange={(v: boolean) => { storage.ParticleStars = v; }}
        />
        <FormSwitchRow
          label="Show Leaves"
          subLabel="Autumn leaves swaying as they fall"
          value={storage.ParticleLeaves}
          onValueChange={(v: boolean) => { storage.ParticleLeaves = v; }}
        />
      </BetterTableRowGroup>

      {/* Performance */}
      <BetterTableRowGroup title="Settings">
        <FormSwitchRow
          label="Performance Mode"
          subLabel="Reduces particle count and disables twinkle/sway. Requires restart."
          value={storage.PerformanceMode}
          onValueChange={(v: boolean) => { storage.PerformanceMode = v; }}
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
          onPress={() => RN.Linking.openURL("https://github.com/")}
        />
      </BetterTableRowGroup>

      <RN.View style={{ height: 20 }} />
      <RN.Text style={styles.versionText}>Stardrift v1.0.0</RN.Text>
      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
