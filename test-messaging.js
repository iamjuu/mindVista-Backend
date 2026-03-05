/**
 * Test script for multi-channel messaging
 * Run with: node test-messaging.js
 */

require('dotenv').config();
const { sendWhatsAppMessage, sendSMS, sendMultiChannelNotification } = require('./utils/messaging');

// Test data
const testData = {
    phone: '919876543210', // Replace with your test phone number
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    appointmentDate: '2026-03-10',
    appointmentTime: '10:00 AM',
    videoCallLink: 'https://mindvista.com/video/test123?role=patient'
};

async function testMessaging() {
    console.log('🧪 Testing Multi-Channel Messaging System\n');
    console.log('Test Data:', testData);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 1: WhatsApp
    console.log('📱 Test 1: WhatsApp Message Generation');
    console.log('-'.repeat(60));
    try {
        const whatsappResult = await sendWhatsAppMessage(
            testData.phone,
            testData.patientName,
            testData.doctorName,
            testData.appointmentDate,
            testData.appointmentTime,
            testData.videoCallLink
        );
        
        if (whatsappResult.success) {
            console.log('✅ WhatsApp test PASSED');
            console.log('📱 WhatsApp URL:', whatsappResult.whatsappURL);
            console.log('💡 Copy this URL and paste in browser to test');
        } else {
            console.log('❌ WhatsApp test FAILED');
            console.log('Error:', whatsappResult.error);
        }
    } catch (error) {
        console.log('❌ WhatsApp test ERROR:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: SMS
    console.log('📲 Test 2: SMS Sending');
    console.log('-'.repeat(60));
    try {
        const smsResult = await sendSMS(
            testData.phone,
            testData.patientName,
            testData.doctorName,
            testData.appointmentDate,
            testData.appointmentTime,
            testData.videoCallLink
        );
        
        if (smsResult.success) {
            console.log('✅ SMS test PASSED');
            console.log('📲 Provider:', smsResult.provider);
            console.log('📱 Phone:', smsResult.phone);
            if (smsResult.messageId) {
                console.log('📧 Message ID:', smsResult.messageId);
            }
        } else {
            console.log('⚠️ SMS test SKIPPED or FAILED');
            console.log('Reason:', smsResult.error || smsResult.message);
            console.log('💡 Configure SMS provider in .env to enable SMS');
        }
    } catch (error) {
        console.log('❌ SMS test ERROR:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Multi-Channel
    console.log('🔔 Test 3: Multi-Channel Notification');
    console.log('-'.repeat(60));
    try {
        const multiResult = await sendMultiChannelNotification(
            'test@example.com',
            testData.phone,
            testData.patientName,
            testData.doctorName,
            testData.appointmentDate,
            testData.appointmentTime,
            testData.videoCallLink
        );
        
        console.log('\n📊 Multi-Channel Results:');
        console.log('   WhatsApp:', multiResult.whatsapp.success ? '✅ Success' : '❌ Failed');
        console.log('   SMS:', multiResult.sms.success ? '✅ Success' : '⚠️ Skipped/Failed');
        
        if (multiResult.whatsapp.success) {
            console.log('\n📱 WhatsApp URL:', multiResult.whatsapp.whatsappURL);
        }
        
        if (multiResult.sms.success) {
            console.log('📲 SMS Provider:', multiResult.sms.provider);
        }
        
    } catch (error) {
        console.log('❌ Multi-channel test ERROR:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Summary
    console.log('📋 Test Summary:');
    console.log('-'.repeat(60));
    console.log('✅ WhatsApp: Always works (generates URL)');
    console.log('📲 SMS: Requires provider configuration in .env');
    console.log('📧 Email: Not tested here (use existing email tests)');
    console.log('\n💡 Next Steps:');
    console.log('1. Copy the WhatsApp URL and test it in your browser');
    console.log('2. Configure SMS provider in .env to enable SMS');
    console.log('3. Test appointment approval in the application');
    console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests
testMessaging().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
