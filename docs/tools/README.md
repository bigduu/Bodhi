# Tools Documentation

This directory contains documentation and usage guides for project tools.

## 📋 Currently Available Tools

### File Operation Tools (5)
- **create_file**: Create a new file
- **read_file**: Read file content
- **update_file**: Update file content
- **append_file**: Append content to a file
- **delete_file**: Delete a file

### Command Execution Tools (1)
- **execute_command**: Execute shell commands

### Search Tools (1)
- **search**: File and content search

## 📋 Document List

- Frontend Mermaid examples moved to Lotus:
  - [`../../../lotus/docs/tools/MERMAID_EXAMPLES.md`](../../../lotus/docs/tools/MERMAID_EXAMPLES.md)

## 🔧 Tool Usage Guide

### Using Tools via General Assistant
The General Assistant category has access to all 8 tools and can automatically select and invoke the appropriate tools based on user requirements.

### Tool Invocation Flow
1. **User Request**: User describes the task to be completed
2. **AI Analysis**: General Assistant analyzes the task and selects the appropriate tool
3. **Parameter Parsing**: AI parses the user request and generates tool parameters
4. **Tool Execution**: The system executes the corresponding tool
5. **Result Return**: The execution result is returned to the user

### Best Practices
- **Clear Description**: Clearly describe the task to be completed
- **Provide Context**: Provide necessary file paths or command context
- **Verify Results**: Check whether the tool execution results meet expectations

## 🛠️ Document Categories

- **Tool Guides**: Usage methods and best practices for specific tools
- **Configuration Documents**: Detailed instructions and optimization plans for tool configuration
- **Migration Documents**: Operation guides for tool upgrades and migrations

## 🔧 Tool Scope

Covers desktop-shell and backend-adjacent tooling docs in Bodhi.  
Frontend diagram/UI docs are maintained in Lotus.

## 🔄 Maintenance

Tool documentation should be maintained in a timely manner as tool versions are updated and project requirements change to ensure the accuracy and practicality of the guides.
