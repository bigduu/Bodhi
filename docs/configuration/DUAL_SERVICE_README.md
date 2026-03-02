# Dual Service Mode Refactoring Guide

## Overview

This refactoring implements support for two service modes:
1. **OpenAI Mode** - Uses standard OpenAI API-compatible interface (default)
2. **Tauri Mode** - Uses the original Tauri command approach

## 🎯 Implemented Features

### Backend (Rust)
- ✅ Keep existing Tauri Commands working normally
- ✅ Added actix-web service providing OpenAI-compatible API
- ✅ Auto-start Web service on `localhost:9562`
- ✅ Support streaming and non-streaming responses
- ✅ Support image message processing

### Frontend (TypeScript/React)
- ✅ Abstract service interface supporting both implementations
- ✅ ServiceFactory manages service switching
- ✅ Added service mode toggle switch in system settings
- ✅ Maintain backward compatibility

## 🔧 Technical Architecture

### Service Abstraction Layer
```
ServiceFactory
├── ChatService (chat functionality)
│   ├── TauriChatService (Tauri implementation)
│   └── OpenAIService (OpenAI API implementation)
├── ToolService (tool functionality, Tauri only)
└── UtilityService (utility functionality, Tauri only)
```

### API Endpoints (OpenAI Compatible)
- `POST /openai/v1/chat/completions` - Chat completion endpoint
- `GET /openai/v1/models` - Get available models

## 🚀 Usage

### Method 1: OpenAI API Mode (Default)
```javascript
// Using ServiceFactory (automatically uses OpenAI mode)
import { serviceFactory } from '../services/ServiceFactory';

await serviceFactory.executePrompt(messages, model, onChunk);
await serviceFactory.getModels();
```

### Method 2: Using OpenAI Library Directly
```javascript
// Using standard OpenAI library
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:9562/openai/v1',
  apiKey: 'dummy-key' // No real key needed
});

const response = await client.chat.completions.create({
  model: 'gpt-4.1',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true
});
```

## ⚙️ Switching Service Modes

**Default Mode**: OpenAI API Mode

### Switching Steps
1. Open system settings (Settings)
2. Find the "Service Mode" toggle
3. Switch to OpenAI or Tauri mode
4. Settings are automatically saved to localStorage

### Mode Descriptions
- **OpenAI Mode** (default): Uses HTTP API calls, compatible with standard OpenAI clients
- **Tauri Mode**: Uses native Tauri commands for more direct system integration

## 🔄 Data Flow

### OpenAI Mode (Default)
```
Frontend → ServiceFactory → OpenAIService → HTTP Request → actix-web → CopilotClient → GitHub Copilot API
```

### Tauri Mode
```
Frontend → ServiceFactory → TauriChatService → Tauri Command → CopilotClient → GitHub Copilot API
```

## 📝 Notes

1. **Tool Functions** - Currently only available in Tauri mode, as they are not part of the standard OpenAI API
2. **Auto-start** - Web service starts automatically when the app launches, no manual control needed
3. **Backward Compatible** - Existing code requires no changes, will automatically use ServiceFactory
4. **Error Handling** - Both modes have complete error handling and logging

## 🛠️ Development Notes

### Adding New Service Features
1. Add methods to the corresponding Service interface
2. Implement Tauri version in TauriService
3. If applicable, implement OpenAI version in OpenAIService
4. Add convenience methods in ServiceFactory

### Testing
- Tauri Mode: Use existing testing methods
- OpenAI Mode: Can test using any OpenAI API-compatible client

## 🎉 Advantages

1. **Flexibility** - Supports two different usage methods
2. **Compatibility** - Compatible with the existing OpenAI ecosystem
3. **Gradual Migration** - Can gradually migrate to the new mode
4. **Extensible** - Easy to add more service implementations
