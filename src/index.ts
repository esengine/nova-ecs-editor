/**
 * Nova ECS Editor - Editor extensions and plugins for NovaECS framework
 * Nova ECS编辑器 - NovaECS框架的编辑器扩展和插件
 * 
 * This package provides decorators, plugins, and utilities for extending
 * the Nova Editor with custom component support.
 * 此包提供装饰器、插件和实用工具，用于使用自定义组件支持扩展Nova编辑器。
 * 
 * @example Basic usage 基本用法:
 * ```typescript
 * import { component, property, EditorComponentPlugin } from '@esengine/nova-ecs-editor';
 * import { Component } from '@esengine/nova-ecs';
 * 
 * @component({
 *   displayName: 'Health 生命值',
 *   description: 'Health component 生命值组件',
 *   icon: '❤️',
 *   category: 'Gameplay'
 * })
 * export class HealthComponent extends Component {
 *   @property({
 *     type: 'number',
 *     displayName: 'Max Health 最大生命值',
 *     min: 1,
 *     max: 1000
 *   })
 *   maxHealth: number = 100;
 * }
 * 
 * export class MyPlugin extends EditorComponentPlugin {
 *   readonly name = 'My Plugin';
 *   readonly version = '1.0.0';
 *   
 *   getComponentTypes() {
 *     return [HealthComponent];
 *   }
 * }
 * ```
 */

// Export decorators for component metadata
// 导出组件元数据的装饰器
export {
  component,
  property,
  createPropertyMetadata,
  getComponentMetadata,
  getAllPropertyMetadata,
  getPropertyMetadata,
  hasComponentMetadata,
  getAllRegisteredComponentTypes,
  clearAllMetadata,
  type ComponentMetadata,
  type PropertyMetadata
} from './decorators/component';

// Export plugin system
// 导出插件系统
export {
  EditorComponentPlugin,
  EditorComponentRegistry,
  discoverAndRegisterComponents,
  getEditorComponentRegistry,
  type ComponentRegistration
} from './plugins/EditorComponentPlugin';

// Export utilities
// 导出实用工具
export * from './utils/ComponentUtils';