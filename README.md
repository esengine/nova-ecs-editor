# @esengine/nova-ecs-editor

Editor extensions and plugins for NovaECS framework.
NovaECS框架的编辑器扩展和插件。

## Overview 概述

This package provides decorators, plugins, and utilities for extending the Nova Editor with custom component support. It allows plugin developers to create editor-compatible components that integrate seamlessly with the Nova Editor's inspector panel and component management system.

此包提供装饰器、插件和实用工具，用于使用自定义组件支持扩展Nova编辑器。它允许插件开发者创建与Nova编辑器的检查器面板和组件管理系统无缝集成的编辑器兼容组件。

## Installation 安装

```bash
npm install @esengine/nova-ecs-editor
```

## Quick Start 快速开始

### 1. Create a Component with Editor Metadata 创建带有编辑器元数据的组件

```typescript
import { Component } from '@esengine/nova-ecs';
import { component, property } from '@esengine/nova-ecs-editor';

@component({
  displayName: 'Health 生命值',
  description: 'Health component for entities 实体的生命值组件',
  icon: '❤️',
  category: 'Gameplay 游戏玩法',
  removable: true,
  addable: true
})
export class HealthComponent extends Component {
  @property({
    type: 'range',
    displayName: 'Max Health 最大生命值',
    description: 'Maximum health points 最大生命值点数',
    min: 1,
    max: 1000,
    step: 1,
    category: 'Health Settings'
  })
  maxHealth: number = 100;

  @property({
    type: 'range',
    displayName: 'Current Health 当前生命值',
    description: 'Current health points 当前生命值点数',
    min: 0,
    max: 1000,
    step: 1,
    category: 'Health Settings'
  })
  currentHealth: number = 100;

  @property({
    type: 'boolean',
    displayName: 'Invincible 无敌',
    description: 'Whether the entity is invincible 实体是否无敌',
    category: 'Health Settings'
  })
  invincible: boolean = false;
}
```

### 2. Create an Editor Plugin 创建编辑器插件

```typescript
import { EditorComponentPlugin } from '@esengine/nova-ecs-editor';
import { HealthComponent } from './components/HealthComponent';
import { ManaComponent } from './components/ManaComponent';

export class GameplayPlugin extends EditorComponentPlugin {
  readonly name = 'Gameplay Plugin';
  readonly version = '1.0.0';
  readonly description = 'Adds gameplay components like health and mana 添加游戏玩法组件如生命值和魔法值';

  getComponentTypes() {
    return [
      HealthComponent,
      ManaComponent
    ];
  }

  // Optional lifecycle hooks
  async onEntityCreate(entity) {
    console.log('Entity created:', entity.id);
  }

  async onComponentAdd(entity, component) {
    if (component instanceof HealthComponent) {
      console.log('Health component added to entity:', entity.id);
    }
  }
}
```

### 3. Register Your Plugin 注册你的插件

```typescript
import { World } from '@esengine/nova-ecs';
import { GameplayPlugin } from './plugins/GameplayPlugin';

const world = new World();
const gameplayPlugin = new GameplayPlugin();

// Register plugin with the world
world.plugins.install('gameplay', gameplayPlugin);
```

## Property Types 属性类型

The `@property` decorator supports various UI types:
`@property`装饰器支持各种UI类型：

### String 字符串
```typescript
@property({
  type: 'string',
  displayName: 'Entity Name 实体名称',
  description: 'Name of the entity 实体的名称'
})
name: string = 'Entity';
```

### Number 数字
```typescript
@property({
  type: 'number',
  displayName: 'Speed 速度',
  min: 0,
  max: 100,
  step: 0.1
})
speed: number = 10;
```

### Boolean 布尔值
```typescript
@property({
  type: 'boolean',
  displayName: 'Enabled 启用',
  description: 'Whether this component is enabled 此组件是否启用'
})
enabled: boolean = true;
```

### Range (Slider) 范围（滑块）
```typescript
@property({
  type: 'range',
  displayName: 'Volume 音量',
  min: 0,
  max: 1,
  step: 0.01
})
volume: number = 0.5;
```

### Color 颜色
```typescript
@property({
  type: 'color',
  displayName: 'Tint Color 着色',
  description: 'Color tint for the sprite 精灵的颜色着色'
})
color: string = '#ffffff';
```

### Enum 枚举
```typescript
@property({
  type: 'enum',
  displayName: 'Blend Mode 混合模式',
  options: ['normal', 'add', 'multiply', 'screen'],
  description: 'Blend mode for rendering 渲染的混合模式'
})
blendMode: string = 'normal';
```

### Vector3 三维向量
```typescript
@property({
  type: 'vector3',
  displayName: 'Position 位置',
  description: 'Position in 3D space 3D空间中的位置'
})
position = { x: 0, y: 0, z: 0 };
```

## Component Categories 组件类别

Organize your components with categories:
使用类别组织你的组件：

```typescript
@component({
  displayName: 'Audio Source 音频源',
  category: 'Audio 音频',
  icon: '🔊'
})
export class AudioSourceComponent extends Component {
  // ...
}

@component({
  displayName: 'Rigidbody 刚体',
  category: 'Physics 物理',
  icon: '⚽'
})
export class RigidbodyComponent extends Component {
  // ...
}
```

## Property Categories 属性类别

Group properties within components:
在组件内分组属性：

```typescript
@component({
  displayName: 'Camera 相机',
  icon: '📷'
})
export class CameraComponent extends Component {
  @property({
    type: 'enum',
    displayName: 'Projection 投影',
    category: 'Camera Settings',
    options: ['perspective', 'orthographic']
  })
  projection: string = 'perspective';

  @property({
    type: 'number',
    displayName: 'Field of View 视野角度',
    category: 'Camera Settings',
    min: 1,
    max: 179
  })
  fov: number = 60;

  @property({
    type: 'number',
    displayName: 'Near Plane 近裁剪面',
    category: 'Clipping Planes',
    min: 0.001,
    max: 1000
  })
  near: number = 0.1;
}
```

## Auto-Discovery 自动发现

For convenience, you can auto-discover all decorated components:
为了方便，你可以自动发现所有装饰的组件：

```typescript
import { discoverAndRegisterComponents } from '@esengine/nova-ecs-editor';

// This will automatically register all components decorated with @component
// 这将自动注册所有用@component装饰的组件
discoverAndRegisterComponents();
```

## Advanced Usage 高级用法

### Custom Property Rendering 自定义属性渲染

While the built-in property types cover most use cases, you can extend the system by implementing custom property renderers in your editor integration.

虽然内置属性类型涵盖了大多数用例，但你可以通过在编辑器集成中实现自定义属性渲染器来扩展系统。

### Plugin Lifecycle Hooks 插件生命周期钩子

Editor plugins can hook into various lifecycle events:
编辑器插件可以挂钩到各种生命周期事件：

```typescript
export class MyPlugin extends EditorComponentPlugin {
  async onWorldUpdateStart(world, deltaTime) {
    // Called at the start of each world update
    // 在每次世界更新开始时调用
  }

  async onWorldUpdateEnd(world, deltaTime) {
    // Called at the end of each world update
    // 在每次世界更新结束时调用
  }

  async onEntityCreate(entity) {
    // Called when an entity is created
    // 实体创建时调用
  }

  async onEntityDestroy(entity) {
    // Called when an entity is destroyed
    // 实体销毁时调用
  }

  async onComponentAdd(entity, component) {
    // Called when a component is added to an entity
    // 组件添加到实体时调用
  }

  async onComponentRemove(entity, component) {
    // Called when a component is removed from an entity
    // 组件从实体移除时调用
  }
}
```

## API Reference API参考

### Decorators 装饰器

- `@component(options)` - Mark a class as an editor-compatible component
- `@property(options)` - Mark a property for editor UI generation

### Classes 类

- `EditorComponentPlugin` - Base class for editor plugins
- `EditorComponentRegistry` - Registry for managing component metadata

### Utilities 实用工具

- `discoverAndRegisterComponents()` - Auto-discover decorated components
- `getEditorComponentRegistry()` - Get the global registry instance
- `getAvailableComponentTypes()` - Get components available for adding
- `getComponentsByCategory()` - Get components grouped by category

## API Documentation API文档

Complete API documentation is available at: [https://esengine.github.io/nova-ecs-editor/](https://esengine.github.io/nova-ecs-editor/)

完整的API文档可在此处查看：[https://esengine.github.io/nova-ecs-editor/](https://esengine.github.io/nova-ecs-editor/)

To generate documentation locally:
本地生成文档：

```bash
npm run docs
```

## Contributing 贡献

Contributions are welcome! Please feel free to submit a Pull Request.
欢迎贡献！请随时提交Pull Request。

## License 许可证

MIT