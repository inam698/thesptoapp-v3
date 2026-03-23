#!/usr/bin/env node

/**
 * Script to upload a single article JSON file to Firestore
 * Usage: node scripts/upload-article.js <path-to-article.json>
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '../configs/TheSpotApp-Firebase-Service-Account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Convert ISO date string to Firestore Timestamp
 */
function toFirestoreTimestamp(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return admin.firestore.Timestamp.fromDate(date);
}

/**
 * Validate article data structure
 */
function validateArticle(article) {
  const requiredFields = ['title', 'summary', 'category', 'tags', 'featuredImage', 'sections'];
  const missingFields = requiredFields.filter(field => !article[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate category
  const validCategories = ['sexual-health', 'menstrual-health', 'mental-health', 'reproductive-rights', 'general'];
  if (!validCategories.includes(article.category)) {
    throw new Error(`Invalid category: ${article.category}. Must be one of: ${validCategories.join(', ')}`);
  }

  // Validate difficulty
  if (article.difficulty && !['beginner', 'intermediate', 'advanced'].includes(article.difficulty)) {
    throw new Error(`Invalid difficulty: ${article.difficulty}. Must be one of: beginner, intermediate, advanced`);
  }

  return true;
}

/**
 * Prepare article data for Firestore
 */
function prepareArticleData(article) {
  const articleData = {
    title: article.title,
    summary: article.summary,
    category: article.category,
    tags: article.tags || [],
    featuredImage: article.featuredImage,
    estimatedReadTime: article.estimatedReadTime || 0,
    isPublished: article.isPublished !== undefined ? article.isPublished : true,
    difficulty: article.difficulty || 'beginner',
    sections: article.sections || [],
  };

  // Convert dates to Firestore Timestamps
  if (article.publishedDate) {
    articleData.publishedDate = toFirestoreTimestamp(article.publishedDate);
  } else {
    articleData.publishedDate = admin.firestore.Timestamp.now();
  }

  if (article.lastUpdated) {
    articleData.lastUpdated = toFirestoreTimestamp(article.lastUpdated);
  } else {
    articleData.lastUpdated = admin.firestore.Timestamp.now();
  }

  // Optional fields
  if (article.author) articleData.author = article.author;
  if (article.sources) articleData.sources = article.sources;
  if (article.targetAudience) articleData.targetAudience = article.targetAudience;
  if (article.viewCount !== undefined) articleData.viewCount = article.viewCount;

  return articleData;
}

/**
 * Upload article to Firestore
 */
async function uploadArticle(filePath) {
  try {
    // Read and parse JSON file
    console.log(`📖 Reading article from: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const article = JSON.parse(fileContent);

    // Validate article
    console.log('✅ Validating article structure...');
    validateArticle(article);

    // Prepare data for Firestore
    const articleData = prepareArticleData(article);

    // Determine document ID
    const documentId = article.id || path.basename(filePath, '.json');

    // Check if article already exists
    const docRef = db.collection('articles').doc(documentId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.log(`⚠️  Article with ID "${documentId}" already exists.`);
      console.log('   Use a different ID or delete the existing article first.');
      process.exit(1);
    }

    // Upload to Firestore
    console.log(`📤 Uploading article "${article.title}" to Firestore...`);
    await docRef.set(articleData);

    console.log(`✅ Successfully uploaded article!`);
    console.log(`   Document ID: ${documentId}`);
    console.log(`   Title: ${article.title}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   Published: ${articleData.isPublished}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading article:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Main execution
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Please provide a path to the article JSON file');
  console.error('Usage: node scripts/upload-article.js <path-to-article.json>');
  console.error('Example: node scripts/upload-article.js data/sampleArticle.json');
  process.exit(1);
}

const absolutePath = path.isAbsolute(filePath) 
  ? filePath 
  : path.join(process.cwd(), filePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`❌ File not found: ${absolutePath}`);
  process.exit(1);
}

uploadArticle(absolutePath);

