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

// Helper function to read and parse JSON with enhanced error handling
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        try {
            return JSON.parse(data);
        } catch (parseError) {
            // Get line and column numbers from error message
            const match = /position (\d+)(?:\s+\(line (\d+) column (\d+)\))?/.exec(parseError.message);
            if (match) {
                const position = parseInt(match[1], 10);
                const line = match[2] ? parseInt(match[2], 10) : null;
                const column = match[3] ? parseInt(match[3], 10) : null;
                
                const contextLines = 3;
                const lines = data.split('\n');
                
                console.error('\nJSON SYNTAX ERROR DETAILS:');
                console.error('-----------------------');
                console.error(`Error in ${path.basename(filePath)} at ${line !== null ? `line ${line}, column ${column}` : `position ${position}`}`);
                console.error(`Error message: ${parseError.message}`);
                
                if (line !== null) {
                    console.error('\nRelevant code section:');
                    const startLine = Math.max(1, line - contextLines);
                    const endLine = Math.min(lines.length, line + contextLines);
                    
                    for (let i = startLine; i <= endLine; i++) {
                        const lineContent = lines[i-1];
                        console.error(`${i === line ? '>' : ' '} ${i}: ${lineContent}`);
                        if (i === line && column !== null) {
                            console.error(`${' '.repeat(column+3)}^-- Syntax error around here`);
                        }
                    }
                    
                    console.error('\nCommon JSON syntax errors:');
                    console.error('1. Missing commas between array elements or object properties');
                    console.error('2. Extra comma after the last element in an array or object');
                    console.error('3. Unclosed brackets, braces, or quotes');
                    console.error('4. Using single quotes instead of double quotes');
                }
            }
            
            throw parseError;
        }
    } catch (error) {
        console.error(`Error reading or parsing JSON file ${filePath}:`, error);
        throw error;
    }
}

// Function to attempt to fix common JSON syntax errors
function attemptToFixJsonFile(filePath) {
    try {
        console.log(`Attempting to fix JSON syntax in ${filePath}...`);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if the file ends with a valid JSON structure
        const lastNonWhitespace = content.trim().slice(-1);
        if (lastNonWhitespace !== ']' && lastNonWhitespace !== '}') {
            console.log('The JSON file does not end with a proper closing bracket/brace.');
            return false;
        }
        
        // The most common error is a trailing comma in objects or arrays
        // Replace instances of ,] with ]
        let fixedContent = content.replace(/,(\s*[\]}])/g, '$1');
        // Replace instances of ,} with }
        fixedContent = fixedContent.replace(/,(\s*})/g, '$1');
        
        // Check if our fix worked
        try {
            JSON.parse(fixedContent);
            console.log('Successfully fixed JSON syntax. Saving changes...');
            fs.writeFileSync(filePath, fixedContent, 'utf8');
            return true;
        } catch (e) {
            console.log('Automatic fixing failed. Please check the file manually.');
            return false;
        }
    } catch (error) {
        console.error('Error while attempting to fix JSON file:', error);
        return false;
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
            let usersData;
            try {
                usersData = readJsonFile(USERS_FILE).slice(0, 20); // Take first 20
            } catch (error) {
                console.log('Error parsing users.json. Attempting to fix...');
                if (attemptToFixJsonFile(USERS_FILE)) {
                    // Try again after fixing
                    usersData = readJsonFile(USERS_FILE).slice(0, 20);
                } else {
                    console.error('Could not automatically fix the users.json file. Please correct it manually.');
                    throw error;
                }
            }
            
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
