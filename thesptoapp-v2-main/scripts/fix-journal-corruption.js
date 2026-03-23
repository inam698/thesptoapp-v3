// Fix journal.tsx corruption: all c/C were replaced with o
const fs = require('fs');
const filePath = 'app/(tabs)/journal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Order matters - longer/more specific patterns first to avoid partial matches
const replacements = [
  // Imports and module names
  ['Spotoolors', 'SpotColors'],
  ['oonstants/oolors', 'constants/Colors'],
  ['useFirestoreoolleotion', 'useFirestoreCollection'],
  ['Ionioons', 'Ionicons'],
  ['veotor-ioons', 'vector-icons'],
  ['Reaot', 'React'],
  ['reaot-native-safe-area-oontext', 'react-native-safe-area-context'],
  ['reaot-native', 'react-native'],
  ['reaot', 'react'],
  ['AotivityIndioator', 'ActivityIndicator'],
  ['TouohableOpaoity', 'TouchableOpacity'],
  
  // JS keywords
  ['funotion', 'function'],
  ['oonst ', 'const '],
  ['asyno ', 'async '],
  ['oatoh', 'catch'],
  
  // React Native props and methods
  ['showsVertioalSorollIndioator', 'showsVerticalScrollIndicator'],
  ['plaoeholderTextoolor', 'placeholderTextColor'],
  ['textAlignVertioal', 'textAlignVertical'],
  ['onohangeText', 'onChangeText'],
  ['keyExtraotor', 'keyExtractor'],
  ['plaoeholder', 'placeholder'],
  ['numberOfLines', 'numberOfLines'], // unchanged
  
  // Style properties (compound first)
  ['textShadowoolor', 'textShadowColor'],
  ['baokgroundoolor', 'backgroundColor'],
  ['shadowoolor', 'shadowColor'],
  ['borderoolor', 'borderColor'],
  ['borderBottomoolor', 'borderBottomColor'],
  ['shadowOpaoity', 'shadowOpacity'],
  ['flexDireotion', 'flexDirection'],
  ['justifyoontent', 'justifyContent'],
  ['paddingVertioal', 'paddingVertical'],
  ['letterSpaoing', 'letterSpacing'],
  ['borderBottomLeftRadius', 'borderBottomLeftRadius'], // no c, just check
  ['borderBottomRightRadius', 'borderBottomRightRadius'],
  ['oolor', 'color'], // generic - after all compound color props
  
  // Variable names
  ['seleotedDate', 'selectedDate'],
  ['setSeleotedDate', 'setSelectedDate'],
  ['showoalendar', 'showCalendar'],
  ['setShowoalendar', 'setShowCalendar'],
  ['ourrentText', 'currentText'],
  ['handleoanoelEdit', 'handleCancelEdit'],
  
  // Style names (compound first)
  ['signInIoonoontainer', 'signInIconContainer'],
  ['signInIoonGradient', 'signInIconGradient'],
  ['signInoontainer', 'signInContainer'],
  ['signInoard', 'signInCard'],
  ['loadingoontainer', 'loadingContainer'],
  ['newEntryoardGradient', 'newEntryCardGradient'],
  ['newEntryoard', 'newEntryCard'],
  ['entryoardGradient', 'entryCardGradient'],
  ['entryoardModern', 'entryCardModern'],
  ['entriesoard', 'entriesCard'],
  ['entryAotionsBox', 'entryActionsBox'],
  ['editAotions', 'editActions'],
  ['aotionButton', 'actionButton'],
  ['oanoelButton', 'cancelButton'],
  ['oanoelButtonText', 'cancelButtonText'],
  ['emptyStateIoonGradient', 'emptyStateIconGradient'],
  ['emptyStateIoon', 'emptyStateIcon'],
  ['searohBarGradient', 'searchBarGradient'],
  ['searohBar', 'searchBar'],
  ['searohInput', 'searchInput'],
  ['searohRow', 'searchRow'],
  ['signInButtonGradient', 'signInButtonGradient'], // no c
  
  // Methods
  ['toLooaleString', 'toLocaleString'],
  ['slioe', 'slice'],
  ['seoonds', 'seconds'],
  
  // Identifiers
  ['searoh', 'search'],
  ['setSearoh', 'setSearch'],
  ['oontainer', 'container'],
  ['baokground', 'background'],
  ['surfaoe', 'surface'],
  ['opaoity', 'opacity'],
  ['oenter', 'center'],
  ['oreate', 'create'],
  ['oanoel', 'cancel'],
  ['oalendar', 'calendar'],
  ['oolleotion', 'collection'],
  ['speoifio', 'specific'],
  ['oolumn', 'column'],
  ['destruotive', 'destructive'],
  ['numerio', 'numeric'],
  ['italio', 'italic'],
  ['aooount', 'account'],
  ['aooess', 'access'],
  ['seoure', 'secure'],
  ['peaoh', 'peach'],
  ['penoil', 'pencil'],
  ['add-oirole', 'add-circle'],
  ['spaoe-between', 'space-between'],
  
  // Hex color corruption
  ['#FFo8E5', '#FFC8E5'],
  
  // Remaining patterns - single c in words
  ['surfaoed', 'surfaced'],
  ['entryAgo', 'entryAgo'], // no c
];

let changeCount = 0;
for (const [corrupted, correct] of replacements) {
  if (corrupted === correct) continue;
  while (content.includes(corrupted)) {
    content = content.replace(corrupted, correct);
    changeCount++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Applied ${changeCount} replacements to ${filePath}`);

// Verify no remaining corruption
const remaining = content.match(/[a-zA-Z]*oo[a-zA-Z]*/g);
if (remaining) {
  const suspicious = [...new Set(remaining)].filter(w => 
    !['too', 'book', 'good', 'floor', 'smooth', 'tool', 'boolean', 'root', 'proof', 'cool', 'loop', 'hoo', 'foo', 'mood'].includes(w.toLowerCase()) &&
    !w.match(/^(hook|look|nook|cook|took|rook|shook|Brook|wood|foot|poor|door|bool|pool|zoom|room|soon|moon|noon|boom|doom|loom|goo|boo|too|moo|woo|coo|poo|zoo|shoot|boost|loose|choose|proof|spoon|scoop|flood|blood|stood|hood|good|food|mood)/i)
  );
  if (suspicious.length > 0) {
    console.log('Potentially suspicious double-o words remaining:', suspicious.slice(0, 20));
  }
}

// Check for common corruption indicators
const indicators = ['oolor', 'oonst', 'funotion', 'asyno', 'Spotoolors', 'Ionioons', 'reaot'];
const stillCorrupted = indicators.filter(i => content.includes(i));
if (stillCorrupted.length > 0) {
  console.log('WARNING: Still corrupted patterns found:', stillCorrupted);
} else {
  console.log('All known corruption patterns fixed!');
}
