/**
 * Component Loader
 * Loads reusable HTML components into the page
 */

(function() {
    'use strict';

    /**
     * Load a component synchronously using document.write (for header)
     * @param {string} componentName - Name of the component file (without .html)
     */
    function loadComponentSync(componentName) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'components/' + componentName + '.html', false);  // Synchronous
        xhr.send();
        if (xhr.status === 200) {
            document.write(xhr.responseText);
        }
    }

    /**
     * Load a component asynchronously
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetId - ID of the element where component should be inserted
     */
    function loadComponentAsync(componentName, targetId) {
        var targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            console.error('Target element not found: ' + targetId);
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'components/' + componentName + '.html', true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                targetElement.innerHTML = xhr.responseText;
                
                // Dispatch custom event to notify that component is loaded
                var event = new CustomEvent('componentLoaded', { 
                    detail: { component: componentName } 
                });
                document.dispatchEvent(event);
            } else {
                console.error('Failed to load component: ' + componentName);
            }
        };
        
        xhr.onerror = function() {
            console.error('Error loading component: ' + componentName);
        };
        
        xhr.send();
    }
    
    /**
     * Load scripts component synchronously to ensure proper execution order
     */
    function loadScriptsSync() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'components/scripts.html', false);  // Synchronous
        xhr.send();
        if (xhr.status === 200) {
            document.write(xhr.responseText);
        }
    }

    /**
     * Load footer when DOM is ready
     */
    function initFooter() {
        // Load footer component
        loadComponentAsync('footer', 'component-footer');
        
        // Add visible class to footer after it loads
        document.addEventListener('componentLoaded', function(e) {
            if (e.detail.component === 'footer') {
                var footer = document.querySelector('.footer');
                if (footer) {
                    // Add visible class after a short delay to trigger transition
                    setTimeout(function() {
                        footer.classList.add('visible');
                    }, 100);
                }
            }
        });
    }

    // Load header synchronously so it's available before scripts run
    // Check if we're in the header placeholder
    var currentScript = document.currentScript || document.querySelector('script[src*="component-loader"]');
    if (currentScript) {
        var headerPlaceholder = document.getElementById('component-header');
        if (headerPlaceholder && !headerPlaceholder.innerHTML) {
            // Load header before this script continues
            loadComponentSync('header');
        }
    }
    
    // Load scripts synchronously
    loadScriptsSync();
    
    // Initialize footer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();