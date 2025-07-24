// Simple API test to check invoice response format
async function testInvoiceAPI() {
    console.log('=== TESTING INVOICE API ===');
    
    try {
        const response = await fetch('/api/invoices?pageNumber=1&pageSize=5');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Raw response type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            console.log('Raw response:', data);
            
            if (data && typeof data === 'object') {
                console.log('Object keys:', Object.keys(data));
                
                // Check for common array properties
                ['data', 'items', 'invoices', 'result', 'results'].forEach(prop => {
                    if (data[prop]) {
                        console.log(`${prop} exists:`, Array.isArray(data[prop]), data[prop]);
                    }
                });
            }
        } else {
            const errorText = await response.text();
            console.error('API Error:', errorText);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
    
    console.log('=== TEST COMPLETE ===');
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a button to manually test
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Invoice API';
    testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px;';
    testButton.onclick = testInvoiceAPI;
    document.body.appendChild(testButton);
    
    // Auto-run test
    setTimeout(testInvoiceAPI, 1000);
});