const mongoose = require('mongoose');
const Doctor = require('./models/doctor');

// Database connection - using same connection string as the app
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindVista';

async function fixEmailIndex() {
    try {
        console.log('[fixEmailIndex] Connecting to MongoDB...');
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('[fixEmailIndex] Connected to MongoDB successfully');
        
        // Get the Doctor collection
        const collection = mongoose.connection.collection('doctors');
        
        // List existing indexes
        console.log('[fixEmailIndex] Listing existing indexes...');
        const indexes = await collection.indexes();
        console.log('[fixEmailIndex] Current indexes:', indexes);
        
        // Check if email index exists
        const emailIndexExists = indexes.some(index => 
            index.key && index.key.email === 1
        );
        
        if (emailIndexExists) {
            console.log('[fixEmailIndex] Email index found, dropping existing email index...');
            try {
                await collection.dropIndex('email_1');
                console.log('[fixEmailIndex] Successfully dropped existing email index');
            } catch (error) {
                console.log('[fixEmailIndex] Error dropping index (might not exist):', error.message);
            }
        } else {
            console.log('[fixEmailIndex] No email index found');
        }
        
        // Create new sparse unique index for email
        console.log('[fixEmailIndex] Creating new sparse unique index for email...');
        await collection.createIndex(
            { email: 1 }, 
            { 
                unique: true, 
                sparse: true,
                name: 'email_1_sparse'
            }
        );
        console.log('[fixEmailIndex] Successfully created sparse unique index for email');
        
        // List indexes again to verify
        console.log('[fixEmailIndex] Listing indexes after update...');
        const newIndexes = await collection.indexes();
        console.log('[fixEmailIndex] Updated indexes:', newIndexes);
        
        console.log('[fixEmailIndex] Index fix completed successfully!');
        
    } catch (error) {
        console.error('[fixEmailIndex] Error fixing email index:', error);
    } finally {
        await mongoose.connection.close();
        console.log('[fixEmailIndex] Database connection closed');
    }
}

// Run the fix
fixEmailIndex(); 