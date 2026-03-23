import { SpotColors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { INFORMATION_CATEGORIES } from "../(tabs)/index";

interface InformationCategory {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  gradient?: string[];
}

export default function InformationListScreen() {
  const router = useRouter();
  const { search } = useLocalSearchParams<{ search?: string }>();
  const [searchQuery, setSearchQuery] = useState(search || "");

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return INFORMATION_CATEGORIES;
    }
    const query = searchQuery.toLowerCase();
    return INFORMATION_CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.id.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background Gradient */}
      <LinearGradient
        colors={[SpotColors.background, SpotColors.background, SpotColors.surface] as any}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header with Decorative Image */}
      <View style={styles.header}>
        <LinearGradient
          colors={[SpotColors.border, SpotColors.background, "transparent"] as any}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <LinearGradient
              colors={[SpotColors.primary, SpotColors.primaryLight] as any}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color={SpotColors.surface} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Information</Text>
            <Text style={styles.headerSubtitle}>
              Your trusted health resources ✨
            </Text>
          </View>
        </View>
        {/* Decorative Image Placeholder - Replace with actual image */}
        <View style={styles.decorativeImageContainer}>
          <LinearGradient
            colors={[SpotColors.primary, SpotColors.primaryLight, SpotColors.background] as any}
            style={styles.decorativeImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="heart" size={40} color={SpotColors.surface} style={{ opacity: 0.6 }} />
          </LinearGradient>
          {/* TODO: Replace with actual image: require("@/assets/images/placeholder-health.png") */}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={[SpotColors.surface, SpotColors.background] as any}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="search" size={20} color={SpotColors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={SpotColors.primary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={SpotColors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Context with Decorative Elements */}
        <View style={styles.infoContent}>
          <View style={styles.infoContextContainer}>
            <View style={styles.decorativeIconContainer}>
              <LinearGradient
                colors={[SpotColors.primary, SpotColors.primaryLight] as any}
                style={styles.decorativeIconGradient}
              >
                <Ionicons name="heart" size={24} color={SpotColors.surface} />
              </LinearGradient>
            </View>
            <Text style={styles.infoContext}>
              Explore trusted health topics and resources. Tap a category below
              to learn more about menstrual health, HIV & STIs, maternal care,
              safe abortion, contraceptives, laws, and more.
            </Text>
          </View>

          {/* Decorative Graphics Section - Replace with actual images */}

          {/* Categories Rows */}
          {filteredCategories.length > 0 ? (
            <View style={styles.infoRowsContainer}>
              {filteredCategories.map((cat: InformationCategory) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.infoCard}
                  onPress={() =>
                    router.push({
                      pathname: "/information/[id]",
                      params: { id: cat.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={
                      (cat.gradient as any) || [
                        cat.color + "DD",
                        cat.color + "AA",
                      ]
                    }
                    style={styles.infoCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                  >
                    {/* Decorative background circle */}
                    <View style={styles.infoCardBgCircle} />
                    <View style={styles.infoCardContent}>
                      <View style={styles.infoIconCircle}>
                        <View style={styles.infoIconInner}>
                          <Ionicons name={cat.icon as any} size={26} color={SpotColors.surface} />
                        </View>
                      </View>
                      <View style={styles.infoCardTextContainer}>
                        <Text style={styles.infoTitle}>{cat.title}</Text>
                        {cat.description && (
                          <Text style={styles.infoDescription} numberOfLines={2}>
                            {cat.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoChevron}>
                        <Ionicons name="chevron-forward" size={18} color={SpotColors.surface} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={SpotColors.primary} />
              <Text style={styles.emptyStateText}>No categories found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try a different search term
              </Text>
            </View>
          )}

          {/* Bottom Decorative Element - Replace with actual pattern image */}
          <View style={styles.bottomDecoration}>
            <LinearGradient
              colors={[SpotColors.border, SpotColors.background, "transparent"] as any}
              style={styles.bottomPattern}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.patternOverlay}>
                <Ionicons name="sparkles" size={20} color={SpotColors.primary} style={{ opacity: 0.3, marginRight: 8 }} />
                <Ionicons name="sparkles" size={16} color={SpotColors.primary} style={{ opacity: 0.2, marginRight: 8 }} />
                <Ionicons name="sparkles" size={20} color={SpotColors.primary} style={{ opacity: 0.3 }} />
              </View>
            </LinearGradient>
            {/* TODO: Replace with: require("@/assets/images/placeholder-pattern.png") */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SpotColors.background,
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: SpotColors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: SpotColors.primary,
    fontWeight: "500",
  },
  decorativeImageContainer: {
    position: "absolute",
    right: -20,
    top: -10,
    width: 120,
    height: 120,
    opacity: 0.3,
    zIndex: 0,
  },
  decorativeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SpotColors.surface,
    borderRadius: 20,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SpotColors.border,
  },
  searchGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: SpotColors.primary,
    fontWeight: "500",
    marginLeft: 12,
    zIndex: 1,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
    zIndex: 1,
  },
  listContainer: {
    paddingBottom: 32,
  },
  listContainerEmpty: {
    flexGrow: 1,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: SpotColors.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    alignItems: "center",
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  articleImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: SpotColors.background,
    marginRight: 12,
  },
  articleContent: {
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: SpotColors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: SpotColors.primary,
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: SpotColors.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  articleSummary: {
    fontSize: 14,
    color: SpotColors.textSecondary,
    lineHeight: 18,
    opacity: 0.85,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: SpotColors.textSecondary,
    fontWeight: "500",
  },
  metaDot: {
    fontSize: 12,
    color: SpotColors.textSecondary,
    marginHorizontal: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: SpotColors.primary,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: SpotColors.textSecondary,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: SpotColors.textSecondary,
    textAlign: "center",
    opacity: 0.7,
  },
  loadMoreButton: {
    backgroundColor: SpotColors.primary + "10",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
  },
  loadMoreText: {
    color: SpotColors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: SpotColors.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: SpotColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: SpotColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: SpotColors.surface,
    fontWeight: "600",
    fontSize: 16,
  },
  infoRowsContainer: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  infoCard: {
    width: "100%",
    borderRadius: 22,
    marginBottom: 14,
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
    position: "relative",
    overflow: "hidden",
  },
  infoCardGradient: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: "relative",
    overflow: "hidden",
  },
  infoCardBgCircle: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  infoCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  infoIconInner: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardTextContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: SpotColors.surface,
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  infoDescription: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
    marginTop: 3,
  },
  infoChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "700",
    color: SpotColors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SpotColors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomDecoration: {
    marginTop: 32,
    height: 80,
    marginHorizontal: -24,
    overflow: "hidden",
  },
  bottomPattern: {
    width: "100%",
    height: "100%",
  },
  patternOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  infoContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  infoContextContainer: {
    backgroundColor: SpotColors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: SpotColors.border,
    position: "relative",
    overflow: "hidden",
  },
  decorativeIconContainer: {
    position: "absolute",
    top: -15,
    right: 20,
    zIndex: 1,
  },
  decorativeIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  infoContext: {
    fontSize: 15,
    color: SpotColors.primary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  graphicsSection: {
    position: "relative",
    height: 100,
    marginBottom: 24,
    marginHorizontal: -24,
  },
  graphicImage1: {
    position: "absolute",
    left: 20,
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  graphicImage2: {
    position: "absolute",
    right: 20,
    top: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  graphicGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
