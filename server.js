const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// File paths
const CONFIG_FILE = path.join(__dirname, 'config.json');
const PROXIES_FILE = path.join(__dirname, 'proxies.json');

// Helper function to read JSON file
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Serve the main page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yahoo Automation Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 20px;
            color: #2d3748;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 15px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.95;
            position: relative;
            z-index: 1;
            font-weight: 300;
        }
        
        .content {
            padding: 40px;
            background: #fafbfc;
        }
        
        .section {
            margin-bottom: 50px;
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 35px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        }
        
        .section h2 {
            color: #1a202c;
            margin-bottom: 30px;
            font-size: 1.8em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.3s ease;
            background: #ffffff;
            color: #2d3748;
            font-family: inherit;
        }
        
        .form-group input:focus, .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
        }
        
        .form-group input:hover, .form-group textarea:hover {
            border-color: #cbd5e0;
        }
        
        .form-row {
            display: flex;
            gap: 20px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn:active {
            transform: translateY(-1px);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        
        .btn-danger:hover {
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
        }
        
        .btn-success:hover {
            box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
            box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
        }
        
        .btn-warning:hover {
            box-shadow: 0 8px 25px rgba(237, 137, 54, 0.4);
        }
        
        .items-list {
            margin-top: 30px;
        }
        
        .item {
            background: linear-gradient(145deg, #ffffff 0%, #f7fafc 100%);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }
        
        .item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: #cbd5e0;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .item-title {
            font-weight: 700;
            color: #1a202c;
            font-size: 1.2em;
            letter-spacing: -0.025em;
        }
        
        .item-actions {
            display: flex;
            gap: 12px;
        }
        
        .edit-form {
            background: linear-gradient(145deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #667eea;
            border-radius: 16px;
            padding: 25px;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.1);
        }
        
        .edit-form h4 {
            color: #1a202c;
            margin-bottom: 20px;
            font-size: 1.3em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .edit-form .form-row {
            margin-bottom: 20px;
        }
        
        .edit-form .form-group {
            margin-bottom: 20px;
        }
        
        .edit-form input {
            background: #ffffff;
            border: 2px solid #e2e8f0;
        }
        
        .edit-form input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .password-container {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #718096;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        
        .password-toggle:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }
        
        .password-input {
            padding-right: 50px !important;
        }
        
        .item-content {
            color: #4a5568;
            line-height: 1.7;
            font-size: 15px;
        }
        
        .item-content strong {
            color: #2d3748;
            font-weight: 600;
        }
        
        .status {
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-success {
            background: #d4edda;
            color: #155724;
        }
        
        .status-error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .message {
            padding: 20px 24px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: none;
            font-weight: 500;
            font-size: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        
        .message.success {
            background: linear-gradient(145deg, #f0fff4 0%, #c6f6d5 100%);
            color: #22543d;
            border-left-color: #48bb78;
        }
        
        .message.error {
            background: linear-gradient(145deg, #fed7d7 0%, #feb2b2 100%);
            color: #742a2a;
            border-left-color: #f56565;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 16px;
            }
            
            .content {
                padding: 20px;
            }
            
            .section {
                padding: 25px;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 2.2em;
            }
            
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            
            .item-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            
            .item-actions {
                width: 100%;
                justify-content: flex-end;
            }
            
            .tabs-nav {
                flex-direction: column;
                gap: 4px;
            }
            
            .tab-button {
                padding: 14px 20px;
                font-size: 14px;
            }
            
            .tab-button .tab-icon {
                font-size: 16px;
            }
        }
        
        /* Loading Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .item {
            animation: fadeInUp 0.6s ease-out;
        }
        
        /* Tabs Styling */
        .tabs-container {
            margin-bottom: 30px;
        }
        
        .tabs-nav {
            display: flex;
            background: #f7fafc;
            border-radius: 12px;
            padding: 6px;
            margin-bottom: 30px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
        
        .tab-button {
            flex: 1;
            padding: 16px 24px;
            background: transparent;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            color: #718096;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .tab-button.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transform: translateY(-1px);
        }
        
        .tab-button:hover:not(.active) {
            background: #edf2f7;
            color: #4a5568;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
            animation: fadeInUp 0.4s ease-out;
        }
        
        .tab-icon {
            font-size: 18px;
        }
        
        /* Field Error Styling */
        .field-error {
            color: #e53e3e;
            font-size: 13px;
            margin-top: 8px;
            padding: 8px 12px;
            background: linear-gradient(145deg, #fed7d7 0%, #feb2b2 100%);
            border: 1px solid #f56565;
            border-radius: 8px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideDown 0.3s ease-out;
        }
        
        .field-error::before {
            content: '⚠️';
            font-size: 14px;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Scrollbar Styling */
        // ::-webkit-scrollbar {
        //     width: 8px;
        // }
        
        // ::-webkit-scrollbar-track {
        //     background: #f1f1f1;
        //     border-radius: 4px;
        // }
        
        // ::-webkit-scrollbar-thumb {
        //     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        //     border-radius: 4px;
        // }
        
        // ::-webkit-scrollbar-thumb:hover {
        //     background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        // }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Yahoo Automation Manager</h1>
            <p>Manage your automation configuration and proxy settings</p>
        </div>
        
        <div class="content">
            <div id="message" class="message"></div>
            
            <!-- Tabs Container -->
            <div class="tabs-container">
                <div class="tabs-nav">
                    <button class="tab-button active" onclick="switchTab('config')">
                        <span class="tab-icon">📋</span>
                        Keyword Management
                    </button>
                    <button class="tab-button" onclick="switchTab('proxy')">
                        <span class="tab-icon">🌐</span>
                        Proxy Management
                    </button>
                </div>
                
                <!-- Config Tab Content -->
                <div id="config-tab" class="tab-content active">
                    <div class="section">
                        <h2>📋 Keyword Management</h2>
                        <form id="configForm">
                            <div class="form-group">
                                <label for="keywords">Keyword:</label>
                                <input type="text" id="keywords" name="keywords" placeholder="e.g., weight loss tips" required>
                                <div id="keywords-error" class="field-error" style="display: none;"></div>
                            </div>
                            <div class="form-group">
                                <label for="target_url">Target URL:</label>
                                <input type="url" id="target_url" name="target_url" placeholder="https://www.example.com/" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="min_duration">Min Duration (seconds):</label>
                                    <input type="number" id="min_duration" name="min_duration" placeholder="165" required>
                                </div>
                                <div class="form-group">
                                    <label for="max_duration">Max Duration (seconds):</label>
                                    <input type="number" id="max_duration" name="max_duration" placeholder="200" required>
                                </div>
                            </div>
                            <button type="submit" class="btn">Add Keyword</button>
                        </form>
                        
                        <div class="items-list" id="configList">
                            <!-- Config items will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- Proxy Tab Content -->
                <div id="proxy-tab" class="tab-content">
                    <div class="section">
                        <h2>🌐 Proxy Management</h2>
                        <form id="proxyForm">
                            <div class="form-group">
                                <label for="server">Server:</label>
                                <input type="text" id="server" name="server" placeholder="http://ip:port" required>
                                <div id="server-error" class="field-error" style="display: none;"></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="username">Username:</label>
                                    <input type="text" id="username" name="username" placeholder="proxy username" required>
                                </div>
                                <div class="form-group">
                                    <label for="password">Password:</label>
                                    <div class="password-container">
                                        <input type="password" id="password" name="password" class="password-input" placeholder="proxy password" required>
                                        <button type="button" class="password-toggle" onclick="togglePassword('password')">👁️</button>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn">Add Proxy</button>
                        </form>
                        
                        <div class="items-list" id="proxyList">
                            <!-- Proxy items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Show message function
        function showMessage(text, type = 'success') {
            const messageEl = document.getElementById('message');
            messageEl.textContent = text;
            messageEl.className = \`message \${type}\`;
            messageEl.style.display = 'block';
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }

        // Show field error function
        function showFieldError(fieldId, message) {
            const errorEl = document.getElementById(fieldId + '-error');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'flex';
            }
        }

        // Hide field error function
        function hideFieldError(fieldId) {
            const errorEl = document.getElementById(fieldId + '-error');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        }

        // Clear all field errors function
        function clearAllFieldErrors() {
            hideFieldError('keywords');
            hideFieldError('server');
        }

        // Show edit field error function
        function showEditFieldError(fieldId, index, message) {
            const errorEl = document.getElementById(\`edit-\${fieldId}-\${index}-error\`);
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'flex';
            }
        }

        // Hide edit field error function
        function hideEditFieldError(fieldId, index) {
            const errorEl = document.getElementById(\`edit-\${fieldId}-\${index}-error\`);
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        }

        // Clear all edit field errors function
        function clearAllEditFieldErrors(index) {
            hideEditFieldError('keywords', index);
            hideEditFieldError('server', index);
        }

        // Load configurations
        async function loadConfigs() {
            try {
                const response = await fetch('/api/configs');
                const configs = await response.json();
                const configList = document.getElementById('configList');
                
                // Reverse the array to show newest items first
                const reversedConfigs = configs.slice().reverse();
                
                configList.innerHTML = reversedConfigs.map((config, originalIndex) => {
                    const index = configs.length - 1 - originalIndex;
                    return \`
                    <div class="item" id="config-\${index}">
                        <div class="item-header">
                            <div class="item-title">\${config.keywords}</div>
                            <div class="item-actions">
                                <button class="btn btn-warning" onclick="editConfig(\${index})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteConfig(\${index})">Delete</button>
                            </div>
                        </div>
                        <div class="item-content">
                            <strong>URL:</strong> \${config.target_url}<br>
                            <strong>Duration:</strong> \${config.stay_duration.min} - \${config.stay_duration.max} seconds
                        </div>
                        <div class="edit-form" id="edit-config-\${index}" style="display: none;">
                            <h4>Edit Keyword</h4>
                            <form onsubmit="updateConfig(event, \${index})">
                                <div class="form-group">
                                    <label>Keyword:</label>
                                    <input type="text" name="keywords" value="\${config.keywords}" required>
                                    <div id="edit-keywords-\${index}-error" class="field-error" style="display: none;"></div>
                                </div>
                                <div class="form-group">
                                    <label>Target URL:</label>
                                    <input type="url" name="target_url" value="\${config.target_url}" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Min Duration:</label>
                                        <input type="number" name="min_duration" value="\${config.stay_duration.min}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Max Duration:</label>
                                        <input type="number" name="max_duration" value="\${config.stay_duration.max}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <button type="submit" class="btn btn-success">Update</button>
                                    <button type="button" class="btn btn-danger" onclick="cancelEdit('config', \${index})">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                \`;
                }).join('');
            } catch (error) {
                console.error('Error loading configs:', error);
            }
        }

        // Load proxies
        async function loadProxies() {
            try {
                const response = await fetch('/api/proxies');
                const proxies = await response.json();
                const proxyList = document.getElementById('proxyList');
                
                // Reverse the array to show newest items first
                const reversedProxies = proxies.slice().reverse();
                
                proxyList.innerHTML = reversedProxies.map((proxy, originalIndex) => {
                    const index = proxies.length - 1 - originalIndex;
                    return \`
                    <div class="item" id="proxy-\${index}">
                        <div class="item-header">
                            <div class="item-title">\${proxy.server}</div>
                            <div class="item-actions">
                                <button class="btn btn-warning" onclick="editProxy(\${index})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteProxy(\${index})">Delete</button>
                            </div>
                        </div>
                        <div class="item-content">
                            <strong>Username:</strong> \${proxy.username}<br>
                            <strong>Password:</strong> ••••••••
                        </div>
                        <div class="edit-form" id="edit-proxy-\${index}" style="display: none;">
                            <h4>Edit Proxy</h4>
                            <form onsubmit="updateProxy(event, \${index})">
                                <div class="form-group">
                                    <label>Server:</label>
                                    <input type="text" name="server" value="\${proxy.server}" required>
                                    <div id="edit-server-\${index}-error" class="field-error" style="display: none;"></div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Username:</label>
                                        <input type="text" name="username" value="\${proxy.username}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Password:</label>
                                        <div class="password-container">
                                            <input type="password" name="password" id="edit-proxy-\${index}-password" class="password-input" value="\${proxy.password}" required>
                                            <button type="button" class="password-toggle" onclick="togglePassword('edit-proxy-\${index}-password')">👁️</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <button type="submit" class="btn btn-success">Update</button>
                                    <button type="button" class="btn btn-danger" onclick="cancelEdit('proxy', \${index})">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                \`;
                }).join('');
            } catch (error) {
                console.error('Error loading proxies:', error);
            }
        }

        // Add configuration
        document.getElementById('configForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear any existing field errors
            clearAllFieldErrors();
            
            const formData = new FormData(e.target);
            const config = {
                keywords: formData.get('keywords'),
                target_url: formData.get('target_url'),
                stay_duration: {
                    min: parseInt(formData.get('min_duration')),
                    max: parseInt(formData.get('max_duration'))
                }
            };
            
            try {
                const response = await fetch('/api/configs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Configuration added successfully!', 'success');
                    e.target.reset();
                    loadConfigs();
                } else {
                    // Check if it's a duplicate keyword error
                    if (result.error && result.error.includes('Keyword already exists')) {
                        showFieldError('keywords', 'This keyword already exists. Please use a different keyword.');
                    } else {
                        showMessage(result.error || 'Error adding configuration', 'error');
                    }
                }
            } catch (error) {
                showMessage('Error adding configuration', 'error');
            }
        });

        // Add proxy
        document.getElementById('proxyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear any existing field errors
            clearAllFieldErrors();
            
            const formData = new FormData(e.target);
            const proxy = {
                server: formData.get('server'),
                username: formData.get('username'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/proxies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(proxy)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Proxy added successfully!', 'success');
                    e.target.reset();
                    loadProxies();
                } else {
                    // Check if it's a duplicate proxy error
                    if (result.error && result.error.includes('Proxy server already exists')) {
                        showFieldError('server', 'This proxy server already exists. Please use a different proxy server.');
                    } else {
                        showMessage(result.error || 'Error adding proxy', 'error');
                    }
                }
            } catch (error) {
                showMessage('Error adding proxy', 'error');
            }
        });

        // Delete configuration
        async function deleteConfig(index) {
            if (confirm('Are you sure you want to delete this configuration?')) {
                try {
                    const response = await fetch(\`/api/configs/\${index}\`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showMessage('Configuration deleted successfully!', 'success');
                        loadConfigs();
                    } else {
                        showMessage('Error deleting configuration', 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting configuration', 'error');
                }
            }
        }

        // Delete proxy
        async function deleteProxy(index) {
            if (confirm('Are you sure you want to delete this proxy?')) {
                try {
                    const response = await fetch(\`/api/proxies/\${index}\`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showMessage('Proxy deleted successfully!', 'success');
                        loadProxies();
                    } else {
                        showMessage('Error deleting proxy', 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting proxy', 'error');
                }
            }
        }

        // Edit configuration
        function editConfig(index) {
            const editForm = document.getElementById(\`edit-config-\${index}\`);
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
            
            // Add event listener to clear error when typing
            if (editForm.style.display === 'block') {
                const keywordInput = editForm.querySelector('input[name="keywords"]');
                if (keywordInput) {
                    keywordInput.addEventListener('input', () => {
                        hideEditFieldError('keywords', index);
                    });
                }
            }
        }

        // Edit proxy
        function editProxy(index) {
            const editForm = document.getElementById(\`edit-proxy-\${index}\`);
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
            
            // Add event listener to clear error when typing
            if (editForm.style.display === 'block') {
                const serverInput = editForm.querySelector('input[name="server"]');
                if (serverInput) {
                    serverInput.addEventListener('input', () => {
                        hideEditFieldError('server', index);
                    });
                }
            }
        }

        // Cancel edit
        function cancelEdit(type, index) {
            const editForm = document.getElementById(\`edit-\${type}-\${index}\`);
            editForm.style.display = 'none';
        }

        // Update configuration
        async function updateConfig(event, index) {
            event.preventDefault();
            
            // Clear any existing edit field errors
            clearAllEditFieldErrors(index);
            
            const formData = new FormData(event.target);
            const config = {
                keywords: formData.get('keywords'),
                target_url: formData.get('target_url'),
                stay_duration: {
                    min: parseInt(formData.get('min_duration')),
                    max: parseInt(formData.get('max_duration'))
                }
            };
            
            try {
                const response = await fetch(\`/api/configs/\${index}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Configuration updated successfully!', 'success');
                    loadConfigs();
                } else {
                    // Check if it's a duplicate keyword error
                    if (result.error && result.error.includes('Keyword already exists')) {
                        showEditFieldError('keywords', index, 'This keyword already exists. Please use a different keyword.');
                    } else {
                        showMessage(result.error || 'Error updating configuration', 'error');
                    }
                }
            } catch (error) {
                showMessage('Error updating configuration', 'error');
            }
        }

        // Update proxy
        async function updateProxy(event, index) {
            event.preventDefault();
            
            // Clear any existing edit field errors
            clearAllEditFieldErrors(index);
            
            const formData = new FormData(event.target);
            const proxy = {
                server: formData.get('server'),
                username: formData.get('username'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch(\`/api/proxies/\${index}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(proxy)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Proxy updated successfully!', 'success');
                    loadProxies();
                } else {
                    // Check if it's a duplicate proxy error
                    if (result.error && result.error.includes('Proxy server already exists')) {
                        showEditFieldError('server', index, 'This proxy server already exists. Please use a different proxy server.');
                    } else {
                        showMessage(result.error || 'Error updating proxy', 'error');
                    }
                }
            } catch (error) {
                showMessage('Error updating proxy', 'error');
            }
        }

        // Toggle password visibility
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        }

        // Tab switching functionality
        function switchTab(tabName) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            event.target.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Load data for the active tab
            if (tabName === 'config') {
                loadConfigs();
            } else if (tabName === 'proxy') {
                loadProxies();
            }
        }

        // Add event listeners to clear field errors when typing
        document.getElementById('keywords').addEventListener('input', () => {
            hideFieldError('keywords');
        });
        
        document.getElementById('server').addEventListener('input', () => {
            hideFieldError('server');
        });

        // Load data on page load
        loadConfigs();
        loadProxies();
    </script>
</body>
</html>
    `);
});

// API Routes for Configurations
app.get('/api/configs', async (req, res) => {
    try {
        const configs = await readJsonFile(CONFIG_FILE);
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read configurations' });
    }
});

app.post('/api/configs', async (req, res) => {
    try {
        const configs = await readJsonFile(CONFIG_FILE);
        
        // Check for duplicate keyword
        const duplicateKeyword = configs.find(config => 
            config.keywords.toLowerCase() === req.body.keywords.toLowerCase()
        );
        
        if (duplicateKeyword) {
            return res.status(400).json({ error: 'Keyword already exists. Please use a different keyword.' });
        }
        
        configs.push(req.body);
        const success = await writeJsonFile(CONFIG_FILE, configs);
        
        if (success) {
            res.json({ message: 'Configuration added successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save configuration' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add configuration' });
    }
});

app.put('/api/configs/:index', async (req, res) => {
    try {
        const configs = await readJsonFile(CONFIG_FILE);
        const index = parseInt(req.params.index);
        
        if (index >= 0 && index < configs.length) {
            // Check for duplicate keyword (excluding current item)
            const duplicateKeyword = configs.find((config, i) => 
                i !== index && config.keywords.toLowerCase() === req.body.keywords.toLowerCase()
            );
            
            if (duplicateKeyword) {
                return res.status(400).json({ error: 'Keyword already exists. Please use a different keyword.' });
            }
            
            configs[index] = req.body;
            const success = await writeJsonFile(CONFIG_FILE, configs);
            
            if (success) {
                res.json({ message: 'Configuration updated successfully' });
            } else {
                res.status(500).json({ error: 'Failed to save configuration' });
            }
        } else {
            res.status(400).json({ error: 'Invalid configuration index' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

app.delete('/api/configs/:index', async (req, res) => {
    try {
        const configs = await readJsonFile(CONFIG_FILE);
        const index = parseInt(req.params.index);
        
        if (index >= 0 && index < configs.length) {
            configs.splice(index, 1);
            const success = await writeJsonFile(CONFIG_FILE, configs);
            
            if (success) {
                res.json({ message: 'Configuration deleted successfully' });
            } else {
                res.status(500).json({ error: 'Failed to save configuration' });
            }             
        } else {
            res.status(400).json({ error: 'Invalid configuration index' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

// API Routes for Proxies
app.get('/api/proxies', async (req, res) => {
    try {
        const proxies = await readJsonFile(PROXIES_FILE);
        res.json(proxies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read proxies' });
    }
});

app.post('/api/proxies', async (req, res) => {
    try {
        const proxies = await readJsonFile(PROXIES_FILE);
        
        // Check for duplicate proxy server
        const duplicateProxy = proxies.find(proxy => 
            proxy.server.toLowerCase() === req.body.server.toLowerCase()
        );
        
        if (duplicateProxy) {
            return res.status(400).json({ error: 'Proxy server already exists. Please use a different proxy server.' });
        }
        
        proxies.push(req.body);
        const success = await writeJsonFile(PROXIES_FILE, proxies);
        
        if (success) {
            res.json({ message: 'Proxy added successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save proxy' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add proxy' });
    }
});

app.put('/api/proxies/:index', async (req, res) => {
    try {
        const proxies = await readJsonFile(PROXIES_FILE);
        const index = parseInt(req.params.index);
        
        if (index >= 0 && index < proxies.length) {
            // Check for duplicate proxy server (excluding current item)
            const duplicateProxy = proxies.find((proxy, i) => 
                i !== index && proxy.server.toLowerCase() === req.body.server.toLowerCase()
            );
            
            if (duplicateProxy) {
                return res.status(400).json({ error: 'Proxy server already exists. Please use a different proxy server.' });
            }
            
            proxies[index] = req.body;
            const success = await writeJsonFile(PROXIES_FILE, proxies);
            
            if (success) {
                res.json({ message: 'Proxy updated successfully' });
            } else {
                res.status(500).json({ error: 'Failed to save proxy' });
            }
        } else {
            res.status(400).json({ error: 'Invalid proxy index' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update proxy' });
    }
});

app.delete('/api/proxies/:index', async (req, res) => {
    try {
        const proxies = await readJsonFile(PROXIES_FILE);
        const index = parseInt(req.params.index);
        
        if (index >= 0 && index < proxies.length) {
            proxies.splice(index, 1);
            const success = await writeJsonFile(PROXIES_FILE, proxies);
            
            if (success) {
                res.json({ message: 'Proxy deleted successfully' });
            } else {
                res.status(500).json({ error: 'Failed to save proxy' });
            }
        } else {
            res.status(400).json({ error: 'Invalid proxy index' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete proxy' });
    }
});

// Start automation process
let automationProcess = null;

function startAutomation() {
    console.log('🤖 Starting Yahoo automation...');
    
    // Spawn the index.js process
    automationProcess = spawn('node', ['index.js'], {
        stdio: 'inherit', // This will show the automation logs in the same console
        cwd: __dirname
    });
    
    automationProcess.on('error', (error) => {
        console.error('❌ Failed to start automation:', error);
    });
    
    automationProcess.on('exit', (code, signal) => {
        console.log(`🤖 Automation process exited with code ${code} and signal ${signal}`);
        
        // Restart automation after a delay if it exits unexpectedly
        if (code !== 0 && signal !== 'SIGTERM') {
            console.log('🔄 Restarting automation in 5 seconds...');
            setTimeout(() => {
                startAutomation();
            }, 5000);
        }
    });
    
    console.log('✅ Automation started successfully');
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Manage your configurations and proxies at http://localhost:${PORT}`);
    
    // Start automation after server is ready
    startAutomation();
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    
    if (automationProcess) {
        console.log('🤖 Terminating automation process...');
        automationProcess.kill('SIGTERM');
    }
    
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    
    if (automationProcess) {
        console.log('🤖 Terminating automation process...');
        automationProcess.kill('SIGTERM');
    }
    
    process.exit(0);
});

module.exports = app;