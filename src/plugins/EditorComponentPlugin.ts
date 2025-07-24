/**
 * Editor Component Plugin - Base class for plugins that register component metadata
 * 编辑器组件插件 - 注册组件元数据的插件基类
 * 
 * This plugin system allows users to extend the editor with custom component support.
 * 该插件系统允许用户使用自定义组件支持扩展编辑器。
 */

import type { ECSPlugin, PluginMetadata, PluginInstallOptions } from '@esengine/nova-ecs';
import type { World, Entity, Component, ComponentType } from '@esengine/nova-ecs';
import { 
  getComponentMetadata, 
  getAllPropertyMetadata, 
  getAllRegisteredComponentTypes,
  type ComponentMetadata,
  type PropertyMetadata 
} from '../decorators/component';

/**
 * Component registration entry for plugins
 * 插件的组件注册条目
 */
export interface ComponentRegistration {
  /** Component constructor 组件构造函数 */
  componentType: ComponentType;
  /** Component metadata for editor UI 用于编辑器UI的组件元数据 */
  metadata: ComponentMetadata;
  /** Property metadata map 属性元数据映射 */
  properties: Map<string, PropertyMetadata>;
}

/**
 * Editor component registry for storing all registered components
 * 存储所有已注册组件的编辑器组件注册表
 */
export class EditorComponentRegistry {
  private static instance: EditorComponentRegistry;
  private registrations = new Map<ComponentType, ComponentRegistration>();

  /**
   * Get singleton instance
   * 获取单例实例
   */
  static getInstance(): EditorComponentRegistry {
    if (!EditorComponentRegistry.instance) {
      EditorComponentRegistry.instance = new EditorComponentRegistry();
    }
    return EditorComponentRegistry.instance;
  }

  /**
   * Register a component with metadata
   * 注册带有元数据的组件
   */
  register(componentType: ComponentType): void {
    const metadata = getComponentMetadata(componentType);
    const properties = getAllPropertyMetadata(componentType);
    
    if (metadata) {
      this.registrations.set(componentType, {
        componentType,
        metadata,
        properties
      });
      
      console.log(`Registered editor component: ${metadata.displayName} (${componentType.name})`);
    }
  }

  /**
   * Get component registration
   * 获取组件注册
   */
  get(componentType: ComponentType): ComponentRegistration | undefined {
    return this.registrations.get(componentType);
  }

  /**
   * Check if component is registered
   * 检查组件是否已注册
   */
  has(componentType: ComponentType): boolean {
    return this.registrations.has(componentType);
  }

  /**
   * Get all registered components
   * 获取所有已注册的组件
   */
  getAll(): ComponentRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Get addable components (can be added via UI)
   * 获取可添加的组件（可通过UI添加）
   */
  getAddable(): ComponentRegistration[] {
    return this.getAll().filter(reg => reg.metadata.addable !== false);
  }

  /**
   * Get components by category
   * 按类别获取组件
   */
  getByCategory(category: string): ComponentRegistration[] {
    return this.getAll().filter(reg => reg.metadata.category === category);
  }

  /**
   * Clear all registrations (for testing)
   * 清除所有注册（用于测试）
   */
  clear(): void {
    this.registrations.clear();
  }

  /**
   * Get statistics about registered components
   * 获取已注册组件的统计信息
   */
  getStatistics(): {
    totalComponents: number;
    addableComponents: number;
    categorizedComponents: Record<string, number>;
  } {
    const categories: Record<string, number> = {};
    let addableCount = 0;

    for (const registration of this.registrations.values()) {
      if (registration.metadata.addable !== false) {
        addableCount++;
      }
      if (registration.metadata.category) {
        categories[registration.metadata.category] = (categories[registration.metadata.category] || 0) + 1;
      }
    }

    return {
      totalComponents: this.registrations.size,
      addableComponents: addableCount,
      categorizedComponents: categories
    };
  }
}

/**
 * Base class for editor component plugins
 * 编辑器组件插件的基类
 * 
 * Plugin developers should extend this class to register their components with the editor.
 * 插件开发者应该扩展此类以向编辑器注册他们的组件。
 * 
 * @example
 * ```typescript
 * import { EditorComponentPlugin, component, property } from '@esengine/nova-ecs-editor';
 * import { Component } from '@esengine/nova-ecs';
 * 
 * @component({
 *   displayName: 'Health 生命值',
 *   description: 'Health component for entities 实体的生命值组件',
 *   icon: '❤️',
 *   category: 'Gameplay 游戏玩法'
 * })
 * class HealthComponent extends Component {
 *   @property({
 *     type: 'range',
 *     displayName: 'Max Health 最大生命值',
 *     description: 'Maximum health points 最大生命值点数',
 *     min: 1,
 *     max: 1000,
 *     step: 1
 *   })
 *   maxHealth: number = 100;
 * }
 * 
 * export class HealthPlugin extends EditorComponentPlugin {
 *   readonly name = 'Health Plugin';
 *   readonly version = '1.0.0';
 *   readonly description = 'Adds health system components 添加生命值系统组件';
 * 
 *   getComponentTypes(): ComponentType[] {
 *     return [HealthComponent];
 *   }
 * }
 * ```
 */
export abstract class EditorComponentPlugin implements ECSPlugin {
  /** Plugin metadata 插件元数据 */
  abstract readonly metadata: PluginMetadata;

  /**
   * Get component types provided by this plugin
   * 获取此插件提供的组件类型
   * 
   * @returns Array of component types 组件类型数组
   */
  abstract getComponentTypes(): ComponentType[];

  /**
   * Install the plugin into the world
   * 将插件安装到世界中
   */
  async install(_world: World, _options?: PluginInstallOptions): Promise<void> {
    const registry = EditorComponentRegistry.getInstance();
    const componentTypes = this.getComponentTypes();
    
    for (const componentType of componentTypes) {
      registry.register(componentType);
    }
    
    console.log(`EditorComponentPlugin "${this.metadata.name}" installed with ${componentTypes.length} components`);
  }

  /**
   * Uninstall the plugin from the world
   * 从世界中卸载插件
   */
  async uninstall(_world: World): Promise<void> {
    // Note: We don't automatically unregister components here because
    // other parts of the editor might still reference them.
    // In a production system, you might want to implement reference counting.
    // 注意：我们不会在这里自动取消注册组件，因为
    // 编辑器的其他部分可能仍然引用它们。
    // 在生产系统中，你可能想要实现引用计数。
    
    console.log(`EditorComponentPlugin "${this.metadata.name}" uninstalled`);
  }

  /**
   * Update plugin (called each frame)
   * 更新插件（每帧调用）
   */
  async update?(_deltaTime: number): Promise<void> {
    // Most component plugins don't need per-frame updates
    // 大多数组件插件不需要每帧更新
  }

  // Optional lifecycle hooks for advanced use cases
  // 高级用例的可选生命周期钩子

  /**
   * Called when a world update starts
   * 当世界更新开始时调用
   */
  async onWorldUpdateStart?(world: World, deltaTime: number): Promise<void>;

  /**
   * Called when a world update ends
   * 当世界更新结束时调用
   */
  async onWorldUpdateEnd?(world: World, deltaTime: number): Promise<void>;

  /**
   * Called when an entity is created
   * 当实体被创建时调用
   */
  async onEntityCreate?(entity: Entity): Promise<void>;

  /**
   * Called when an entity is destroyed
   * 当实体被销毁时调用
   */
  async onEntityDestroy?(entity: Entity): Promise<void>;

  /**
   * Called when a component is added to an entity
   * 当组件被添加到实体时调用
   */
  async onComponentAdd?(entity: Entity, component: Component): Promise<void>;

  /**
   * Called when a component is removed from an entity
   * 当组件从实体移除时调用
   */
  async onComponentRemove?(entity: Entity, component: Component): Promise<void>;
}

/**
 * Auto-discovery function that finds all decorated components
 * 查找所有装饰组件的自动发现功能
 * 
 * This function can be called to automatically register all components
 * that have been decorated with @component.
 * 可以调用此函数自动注册所有用@component装饰的组件。
 */
export function discoverAndRegisterComponents(): void {
  const registry = EditorComponentRegistry.getInstance();
  const componentTypes = getAllRegisteredComponentTypes();
  
  for (const componentType of componentTypes) {
    registry.register(componentType);
  }
  
  console.log(`Auto-discovered and registered ${componentTypes.length} components`);
}

/**
 * Get the global editor component registry instance
 * 获取全局编辑器组件注册表实例
 */
export function getEditorComponentRegistry(): EditorComponentRegistry {
  return EditorComponentRegistry.getInstance();
}