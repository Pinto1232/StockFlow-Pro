// Debug script to identify problematic navigation links
// This script can be temporarily included to debug URL construction issues

(function() {
    'use strict';
    
    console.log('🔍 Navigation Debug Script Loaded');
    
    function debugNavigationLinks() {
        console.group('🔗 Navigation Links Analysis');
        
        // Find all navigation links
        const allLinks = document.querySelectorAll('a, .nav-link');
        console.log(`Found ${allLinks.length} total links`);
        
        const problematicLinks = [];
        const validLinks = [];
        
        allLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const linkText = link.textContent?.trim() || '[No text]';
            const linkInfo = {
                index: index,
                element: link,
                href: href,
                text: linkText,
                classes: link.className
            };
            
            // Check for problematic hrefs
            if (!href) {
                linkInfo.issue = 'Missing href attribute';
                problematicLinks.push(linkInfo);
            } else if (href.trim() === '') {
                linkInfo.issue = 'Empty href attribute';
                problematicLinks.push(linkInfo);
            } else if (href === '#') {
                linkInfo.issue = 'Placeholder href (#)';
                problematicLinks.push(linkInfo);
            } else if (href === 'javascript:void(0)') {
                linkInfo.issue = 'JavaScript void href';
                problematicLinks.push(linkInfo);
            } else if (href.startsWith('javascript:')) {
                linkInfo.issue = 'JavaScript href';
                problematicLinks.push(linkInfo);
            } else {
                // Try to construct URL to test validity
                try {
                    if (href.startsWith('/')) {
                        // Relative URL - should be fine
                        linkInfo.type = 'Relative URL';
                        validLinks.push(linkInfo);
                    } else {
                        // Try to construct absolute URL
                        new URL(href);
                        linkInfo.type = 'Absolute URL';
                        validLinks.push(linkInfo);
                    }
                } catch (error) {
                    linkInfo.issue = `Invalid URL: ${error.message}`;
                    problematicLinks.push(linkInfo);
                }
            }
        });
        
        console.log(`✅ Valid links: ${validLinks.length}`);
        console.log(`❌ Problematic links: ${problematicLinks.length}`);
        
        if (problematicLinks.length > 0) {
            console.group('❌ Problematic Links Details');
            problematicLinks.forEach(link => {
                console.warn(`Link ${link.index}: "${link.text}"`, {
                    href: link.href,
                    issue: link.issue,
                    classes: link.classes,
                    element: link.element
                });
            });
            console.groupEnd();
        }
        
        if (validLinks.length > 0) {
            console.group('✅ Valid Links Summary');
            validLinks.forEach(link => {
                console.log(`Link ${link.index}: "${link.text}" (${link.type})`, {
                    href: link.href,
                    classes: link.classes
                });
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        return {
            total: allLinks.length,
            valid: validLinks.length,
            problematic: problematicLinks.length,
            problematicLinks: problematicLinks
        };
    }
    
    // Run debug when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', debugNavigationLinks);
    } else {
        debugNavigationLinks();
    }
    
    // Make function available globally for manual debugging
    window.debugNavigationLinks = debugNavigationLinks;
    
    console.log('💡 Run debugNavigationLinks() in console to re-analyze links');
})();