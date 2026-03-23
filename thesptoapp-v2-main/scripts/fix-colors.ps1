$ErrorActionPreference = "Stop"
$root = "c:\Users\emman\Documents\thesptoapp-v2-main\thesptoapp-v2-main"
Set-Location $root

function Read-File($rel) {
    return [System.IO.File]::ReadAllText("$root\$rel")
}
function Write-File($rel, $content) {
    [System.IO.File]::WriteAllText("$root\$rel", $content)
    Write-Output "Updated: $rel"
}
function Fix-Colors($rel, $replacements) {
    $c = Read-File $rel
    foreach ($r in $replacements) {
        $c = $c -replace $r[0], $r[1]
    }
    Write-File $rel $c
}

# Common style replacements (used across many files)
$styleReplacements = @(
    @('color: "#D44A7A"', 'color: SpotColors.primary'),
    @('color: "#FF9BB5"', 'color: SpotColors.primary'),
    @('color: "#A18CCF"', 'color: SpotColors.primary'),
    @('color: "#8E8E93"', 'color: SpotColors.textSecondary'),
    @('color: "#C7C7CC"', 'color: SpotColors.textSecondary'),
    @('color: "#B18AE4"', 'color: SpotColors.primary'),
    @('shadowColor: "#FF9BB5"', 'shadowColor: SpotColors.primary'),
    @('shadowColor: "#D4A5E8"', 'shadowColor: SpotColors.primary'),
    @('shadowColor: "#B18AE4"', 'shadowColor: SpotColors.primary'),
    @('backgroundColor: "#FFF5F8"', 'backgroundColor: SpotColors.background'),
    @('backgroundColor: "#F8F9FA"', 'backgroundColor: SpotColors.background'),
    @('backgroundColor: "#FFE5F0"', 'backgroundColor: SpotColors.border'),
    @('backgroundColor: "#F2F2F7"', 'backgroundColor: SpotColors.background'),
    @('borderColor: "#FFE5F0"', 'borderColor: SpotColors.border'),
    @('borderColor: "#FFB8C8"', 'borderColor: SpotColors.border'),
    @('borderColor: ''#FFE5F0''', 'borderColor: SpotColors.border'),
    @('borderColor: ''#F7C873''', 'borderColor: SpotColors.border'),
    @('shadowColor: ''#F7C873''', 'shadowColor: SpotColors.primary'),
    @('color: ''#B18AE4''', 'color: SpotColors.primary'),
    @('shadowColor: ''#FF9BB5''', 'shadowColor: SpotColors.primary'),
    @('color: ''#D44A7A''', 'color: SpotColors.primary'),
    @('color: ''#FF9BB5''', 'color: SpotColors.primary'),
    @('backgroundColor: ''#FFF5F8''', 'backgroundColor: SpotColors.background'),
    @('backgroundColor: ''#FFE5F0''', 'backgroundColor: SpotColors.border')
)

# Gradient replacements
$gradientReplacements = @(
    @('colors=\{\["#FFB8D8", "#FF9BB5"\]\}', 'colors={[SpotColors.primary, SpotColors.primaryLight] as any}'),
    @('colors=\{\["#FFB8D8", "#FF9BB5", "#FFC8E5"\]\}', 'colors={[SpotColors.primary, SpotColors.primaryLight, SpotColors.background] as any}'),
    @('colors=\{\["#FFB8D8", "#FF9BB5", "#D4A5E8"\]\}', 'colors={[SpotColors.primary, SpotColors.primaryLight, SpotColors.background] as any}'),
    @('colors=\{\["#FFF5F8", "#FFF0F5", "#FFFFFF"\]\}', 'colors={[SpotColors.background, SpotColors.background, SpotColors.surface] as any}'),
    @('colors=\{\["#FFFFFF", "#FFF5F8", "#FFE5F0"\]\}', 'colors={[SpotColors.surface, SpotColors.background, SpotColors.border] as any}'),
    @('colors=\{\["#FFE5F0", "#FFF5F8", "transparent"\]\}', 'colors={[SpotColors.border, SpotColors.background, "transparent"] as any}'),
    @('colors=\{\["#D4A5E8", "#C88FE0"\]\}', 'colors={[SpotColors.primary, SpotColors.primaryLight] as any}'),
    @('colors=\{\["#F5D5E8", "#E8C5F5"\]\}', 'colors={[SpotColors.primaryLight, SpotColors.background] as any}'),
    @('colors=\{\["#FFE5F0", "#FFF5F8"\]\}', 'colors={[SpotColors.border, SpotColors.background] as any}'),
    @('colors=\{\["#FFFFFF", "#FFF5F8"\]\}', 'colors={[SpotColors.surface, SpotColors.background] as any}')
)

# JSX attribute replacements
$jsxReplacements = @(
    @('color="#FF9BB5"', 'color={SpotColors.primary}'),
    @('color="#FFB8C8"', 'color={SpotColors.primary}'),
    @('color="#D4A5E8"', 'color={SpotColors.primary}'),
    @('color="#B0A4C6"', 'color={SpotColors.primary}'),
    @('placeholderTextColor="#FFB8C8"', 'placeholderTextColor={SpotColors.textSecondary}')
)

# ─── information/[id].tsx ───
$allReplacements = $gradientReplacements + $styleReplacements + $jsxReplacements
Fix-Colors "app\information\[id].tsx" $allReplacements

# ─── information/index.tsx ───
Fix-Colors "app\information\index.tsx" $allReplacements

# ─── app/(tabs)/index.tsx ─── (has hardcoded category color/gradient arrays)
$homeContent = Read-File "app\(tabs)\index.tsx"

# Category and action color/gradient data arrays
$homeContent = $homeContent -replace 'color: "#E8B4D1"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#F4A5B8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#D4A5E8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#F5B8C8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#FFB8D8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#E8A5D4"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#D4B8E8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#F5C8D8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#F4A5C8"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#FF9BB5".*//.*$', 'color: SpotColors.primary,'

# Gradient arrays in data
$homeContent = $homeContent -replace 'gradient: \["#F5D5E8", "#E8B4D1"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFC0D3", "#F4A5B8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#E8D5F5", "#D4A5E8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFD5E5", "#F5B8C8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFD5ED", "#FFB8D8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#F5D5ED", "#E8A5D4"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#E8D5F5", "#D4B8E8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFE5ED", "#F5C8D8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFC8E5", "#F4A5C8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFB8D8", "#FF9BB5"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#E8C5F5", "#D4A5E8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#FFD5E5", "#FFB8C8"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'
$homeContent = $homeContent -replace 'gradient: \["#F5D5E8", "#E8B4D1"\]', 'gradient: [SpotColors.primaryLight, SpotColors.primary]'

# Inline style hardcoded colors
$homeContent = $homeContent -replace 'color: "#D44A7A"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#FF9BB5"', 'color: SpotColors.primary'
$homeContent = $homeContent -replace 'color: "#8E8E93"', 'color: SpotColors.textSecondary'
$homeContent = $homeContent -replace 'color: "#C7C7CC"', 'color: SpotColors.textSecondary'
$homeContent = $homeContent -replace 'backgroundColor: "#F2F2F7"', 'backgroundColor: SpotColors.background'
$homeContent = $homeContent -replace 'shadowColor: "#FF9BB5"', 'shadowColor: SpotColors.primary'

Write-File "app\(tabs)\index.tsx" $homeContent
Write-Output "Updated: app/(tabs)/index.tsx"

# ─── app/(tabs)/journal.tsx ───
Fix-Colors "app\(tabs)\journal.tsx" ($styleReplacements + @(
    @('colors=\{.*"#FFC8E5"\]', 'colors={[SpotColors.primary, SpotColors.primaryLight, SpotColors.background]')
))

# ─── app/(tabs)/period-tracker.tsx ───
$ptContent = Read-File "app\(tabs)\period-tracker.tsx"
$ptContent = $ptContent -replace 'borderColor: ''#F7C873''', 'borderColor: SpotColors.border'
$ptContent = $ptContent -replace 'shadowColor: ''#F7C873''', 'shadowColor: SpotColors.primary'
$ptContent = $ptContent -replace 'color: ''#B18AE4''', 'color: SpotColors.primary'
$ptContent = $ptContent -replace '"#FFC8E5"', 'SpotColors.background'
$ptContent = $ptContent -replace '"#FFD5E5"', 'SpotColors.primaryLight'
$ptContent = $ptContent -replace '"#F5D5E8"', 'SpotColors.primaryLight'
$ptContent = $ptContent -replace '"#E8C5F5"', 'SpotColors.primaryLight'
Write-File "app\(tabs)\period-tracker.tsx" $ptContent
Write-Output "Updated: app/(tabs)/period-tracker.tsx"

# ─── components/ArticleReader.tsx ───
$arContent = Read-File "components\ArticleReader.tsx"
$arContent = $arContent -replace "backgroundColor: '#F8F9FA'", 'backgroundColor: SpotColors.background'
$arContent = $arContent -replace "borderBottomColor: '#E5E5E5'", 'borderBottomColor: SpotColors.border'
$arContent = $arContent -replace "backgroundColor: '#E5E5E5'", 'backgroundColor: SpotColors.border'
Write-File "components\ArticleReader.tsx" $arContent
Write-Output "Updated: components/ArticleReader.tsx"

# ─── app/information/article/[id].tsx ───
$artContent = Read-File "app\information\article\[id].tsx"
$artContent = $artContent -replace 'color="#B0A4C6"', 'color={SpotColors.primary}'
$artContent = $artContent -replace "backgroundColor: '#F8F9FA'", 'backgroundColor: SpotColors.background'
$artContent = $artContent -replace "color: '#8E8E93'", 'color: SpotColors.textSecondary'
Write-File "app\information\article\[id].tsx" $artContent
Write-Output "Updated: app/information/article/[id].tsx"

# ─── components/ThemedText.tsx ───
$ttContent = Read-File "components\ThemedText.tsx"
$ttContent = $ttContent -replace "color: '#0a7ea4'", "color: '#C69FD5'"
Write-File "components\ThemedText.tsx" $ttContent
Write-Output "Updated: components/ThemedText.tsx"

# ─── components/onboarding/OnboardingStep.tsx ───
$osContent = Read-File "components\onboarding\OnboardingStep.tsx"
$osContent = $osContent -replace "backgroundColor = '#ffffff'", "backgroundColor = '#FDFDC9'"
$osContent = $osContent -replace "textColor = '#000000'", "textColor = '#2E2E2E'"
Write-File "components\onboarding\OnboardingStep.tsx" $osContent
Write-Output "Updated: components/onboarding/OnboardingStep.tsx"

Write-Output "`nAll files updated!"