import { DiscordLogger } from '../dist/DiscordLogger.js';

// Mock Express request object untuk testing
function createMockRequest(options = {}) {
  return {
    method: options.method || 'POST',
    url: options.url || '/api/v1/auth/test-error-with-file',
    headers: {
      'content-type': options.contentType || 'multipart/form-data; boundary=----------------------------PhMedOf57zh30tIupwNB8',
      ...options.headers
    },
    body: options.body || {
      name: "Test Upload",
      description: "Test file upload for Discord logging"
    },
    file: options.file || {
      fieldname: 'file',
      originalname: 'test-file.txt',
      filename: 'test-file.txt',
      mimetype: 'text/plain',
      size: 40
    },
    files: options.files || [
      {
        fieldname: 'file',
        originalname: 'test-file.txt',
        filename: 'test-file.txt',
        mimetype: 'text/plain',
        size: 40
      },
      {
        fieldname: 'file_lainnya',
        originalname: 'test-file.txt',
        filename: 'test-file.txt',
        mimetype: 'text/plain',
        size: 40
      }
    ]
  };
}

// Testing function
async function testDiscordLogger() {
  console.log('🧪 Starting DiscordLogger Tests...\n');
  
  // Isi webhookUrl untuk ujicoba
  const webhookUrl = 'https://discord.com/api/webhooks/1203293855827623977/ScZREDU_NtzEw5ESHxhMl0zdd2Nd53IlSZMmek0756N7JfVxL7A67m6ve4UjAOI9fb8N';
  const logger = new DiscordLogger(webhookUrl);

  try {
    // Test 1: Internal Server Error with file upload
    console.log('📤 Test 1: Sending Internal Server Error with file upload...');
    const mockRequest1 = createMockRequest();
    
    const stackTrace1 = `Error: Test error with file upload
    at AuthController.testErrorWithFile (/app/src/auth/auth.controller.ts:48:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)`;

    await logger.send(
      mockRequest1,
      '🚨 Internal Server Error',
      'Test error with file upload',
      15548997, // Red color
      stackTrace1
    );
    
    console.log('✅ Test 1: Internal Server Error sent successfully!\n');

    // Test 2: Success message without files
    console.log('📤 Test 2: Sending Success message without files...');
    const mockRequest2 = createMockRequest({
      method: 'GET',
      url: '/api/v1/users/profile',
      contentType: 'application/json',
      body: { userId: 123, action: 'get_profile' },
      file: null,
      files: null
    });

    await logger.send(
      mockRequest2,
      '✅ Success Response',
      'User profile retrieved successfully',
      5763719, // Green color
      null
    );
    
    console.log('✅ Test 2: Success message sent successfully!\n');

    // Test 3: Warning with multiple files
    console.log('📤 Test 3: Sending Warning with multiple files...');
    const mockRequest3 = createMockRequest({
      method: 'POST',
      url: '/api/v1/upload/multiple',
      body: { 
        uploadType: 'batch',
        category: 'documents',
        tags: ['important', 'work']
      }
    });

    await logger.send(
      mockRequest3,
      '⚠️ Warning',
      'Multiple file upload completed with warnings',
      16776960, // Yellow color
      'Warning: Some files may not be processed correctly'
    );
    
    console.log('✅ Test 3: Warning message sent successfully!\n');

    // Test 4: Error with empty body
    console.log('📤 Test 4: Sending Error with empty body...');
    const mockRequest4 = createMockRequest({
      method: 'DELETE',
      url: '/api/v1/files/delete',
      body: null,
      file: null,
      files: null
    });

    await logger.send(
      mockRequest4,
      '❌ Bad Request',
      'Request body is required but was empty',
      15548997, // Red color
      'ValidationError: Body cannot be empty for this endpoint'
    );
    
    console.log('✅ Test 4: Error with empty body sent successfully!\n');

    console.log('🎉 All tests completed successfully!');
    console.log('📱 Check your Discord channel to see the messages.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run tests
testDiscordLogger();
