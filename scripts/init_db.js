const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Configuration (adjust if necessary)
const MONGO_URI = "mongodb://localhost:27017/";
const DATABASE_NAME = "BookRecDB";
const SALT_ROUNDS = 10; // For bcrypt hashing

// Paths to JSON data files
const JSON_DIR = path.join(__dirname, '..', 'json_files');
const USERS_FILE = path.join(JSON_DIR, 'users.json');
const BOOKS_FILE = path.join(JSON_DIR, 'books.json');
const REVIEWS_FILE = path.join(JSON_DIR, 'reviews.json');

// Helper function to read and parse JSON
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading or parsing JSON file ${filePath}:`, error);
        throw error; // Re-throw to stop execution if a file is essential
    }
}

async function initializeDatabase() {
    const client = new MongoClient(MONGO_URI);
    console.log('Attempting to connect to MongoDB...');

    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        const db = client.db(DATABASE_NAME);
        console.log(`Using database: ${DATABASE_NAME}`);

        const usersCollection = db.collection('users');
        const booksCollection = db.collection('books');
        const reviewsCollection = db.collection('reviews');

        // --- Initialize Users ---
        const userCount = await usersCollection.countDocuments();
        if (userCount === 0) {
            console.log('Users collection is empty. Initializing...');
            const usersData = readJsonFile(USERS_FILE).slice(0, 20); // Take first 20
            const usersToInsert = await Promise.all(usersData.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, SALT_ROUNDS), // Hash password
                registration_date: new Date(user.registration_date) // Convert to Date object
            })));
            await usersCollection.insertMany(usersToInsert);
            console.log(`Inserted ${usersToInsert.length} users.`);
        } else {
            console.log('Users collection already contains data. Skipping initialization.');
        }

        // --- Initialize Books ---
        const bookCount = await booksCollection.countDocuments();
        if (bookCount === 0) {
            console.log('Books collection is empty. Initializing...');
            const booksData = readJsonFile(BOOKS_FILE).slice(0, 20); // Take first 20
            // No date conversion needed for books based on schema
            await booksCollection.insertMany(booksData);
            console.log(`Inserted ${booksData.length} books.`);
        } else {
            console.log('Books collection already contains data. Skipping initialization.');
        }

        // --- Initialize Reviews ---
        const reviewCount = await reviewsCollection.countDocuments();
        if (reviewCount === 0) {
            console.log('Reviews collection is empty. Initializing...');
            const reviewsData = readJsonFile(REVIEWS_FILE).slice(0, 20); // Take first 20

            // Fetch inserted users and books to map emails/titles to ObjectIds
            const insertedUsers = await usersCollection.find({}, { projection: { email: 1 } }).toArray();
            const insertedBooks = await booksCollection.find({}, { projection: { title: 1 } }).toArray();

            const userEmailToId = insertedUsers.reduce((acc, user) => {
                acc[user.email] = user._id;
                return acc;
            }, {});

            const bookTitleToId = insertedBooks.reduce((acc, book) => {
                acc[book.title] = book._id;
                return acc;
            }, {});

            const reviewsToInsert = reviewsData
                .map(review => {
                    const userId = userEmailToId[review.user_email];
                    const bookId = bookTitleToId[review.book_title];

                    // Only insert review if corresponding user and book were found
                    if (userId && bookId) {
                        return {
                            user_id: userId, // Use ObjectId
                            book_id: bookId, // Use ObjectId
                            rating: review.rating,
                            comment: review.comment,
                            review_date: new Date(review.review_date) // Convert to Date object
                        };
                    } else {
                        console.warn(`Skipping review for book "${review.book_title}" by user "${review.user_email}" due to missing user or book reference.`);
                        return null; // Filter out reviews with missing references
                    }
                })
                .filter(review => review !== null); // Remove null entries

            if (reviewsToInsert.length > 0) {
                await reviewsCollection.insertMany(reviewsToInsert);
                console.log(`Inserted ${reviewsToInsert.length} reviews.`);
            } else {
                 console.log('No valid reviews found to insert (check user/book references).');
            }

        } else {
            console.log('Reviews collection already contains data. Skipping initialization.');
        }

        console.log('Database initialization check complete.');

    } catch (error) {
        console.error('An error occurred during database initialization:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

// Run the initialization function
initializeDatabase();
