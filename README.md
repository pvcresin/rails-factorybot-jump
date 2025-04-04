# Rails FactoryBot Jump

A VSCode extension that enables quick navigation from Rails test files to FactoryBot factory definitions.

## Features

- Jump from FactoryBot calls in Rails test files to their corresponding factory definitions
- Supports the following patterns:
  - `create(:factory_name)`
  - `create :factory_name`
  - `build(:factory_name)`
  - `build :factory_name`

## Installation

1. Open VSCode
2. Open the Extensions tab (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Rails FactoryBot Jump"
4. Click Install

Alternatively, you can install directly from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=your-name.rails-factorybot-jump).

## Usage

1. Open a Rails test file
2. Hover over a FactoryBot call (e.g., `create(:user)`)
3. A tooltip will show the operation instructions
4. Hold Cmd (Mac) or Ctrl (Windows) and click
5. Jump to the corresponding factory definition file

## Supported Patterns

```ruby
# All of the following patterns are supported
create(:user)
create :user
build(:user)
build :user
```

## For Developers

### Development Environment Setup

1. Clone the repository

```bash
git clone https://github.com/your-username/rails-factorybot-jump.git
```

2. Install dependencies

```bash
cd rails-factorybot-jump
npm install
```

3. Run in development mode

```bash
npm run watch
```

4. Press F5 to start debugging

## License

MIT License

## Contributing

Please report bugs and feature requests through Issues or Pull Requests.
