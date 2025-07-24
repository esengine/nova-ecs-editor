/**
 * Component decorators for editor integration
 * 编辑器集成的组件装饰器
 * 
 * These decorators allow users to mark their components for editor support.
 * 这些装饰器允许用户标记他们的组件以获得编辑器支持。
 */

import type { ComponentType } from '@esengine/nova-ecs';

/**
 * Property metadata for editor UI generation
 * 用于编辑器UI生成的属性元数据
 */
export interface PropertyMetadata {
  /** Property display name 属性显示名称 */
  displayName?: string;
  /** Property description 属性描述 */
  description?: string;
  /** Property type for UI rendering 用于UI渲染的属性类型 */
  type: 'string' | 'number' | 'boolean' | 'vector2' | 'vector3' | 'color' | 'range' | 'enum';
  /** Whether property is readonly 属性是否只读 */
  readonly?: boolean;
  /** Minimum value for number/range types 数字/范围类型的最小值 */
  min?: number;
  /** Maximum value for number/range types 数字/范围类型的最大值 */
  max?: number;
  /** Step value for number/range types 数字/范围类型的步长值 */
  step?: number;
  /** Options for enum types 枚举类型的选项 */
  options?: string[];
  /** Property category for grouping 用于分组的属性类别 */
  category?: string;
  /** Property order in UI 在UI中的属性顺序 */
  order?: number;
}

/**
 * Component metadata for editor integration
 * 用于编辑器集成的组件元数据
 */
export interface ComponentMetadata {
  /** Component display name 组件显示名称 */
  displayName: string;
  /** Component description 组件描述 */
  description?: string;
  /** Component icon (emoji or class name) 组件图标（表情符号或类名） */
  icon?: string;
  /** Component category for grouping 用于分组的组件类别 */
  category?: string;
  /** Whether component can be removed 组件是否可以移除 */
  removable?: boolean;
  /** Whether component can be added via UI 是否可以通过UI添加组件 */
  addable?: boolean;
  /** Component order in UI 在UI中的组件顺序 */
  order?: number;
}

// Global metadata storage
// 全局元数据存储
const componentMetadataMap = new WeakMap<ComponentType, ComponentMetadata>();
const propertyMetadataMap = new WeakMap<ComponentType, Map<string, PropertyMetadata>>();

/**
 * Component decorator - marks a class as an editor-compatible component
 * 组件装饰器 - 将类标记为编辑器兼容的组件
 * 
 * @param options Component metadata options 组件元数据选项
 * 
 * @example
 * ```typescript
 * @component({
 *   displayName: 'Transform 变换',
 *   description: 'Transform component for position, rotation and scale 用于位置、旋转和缩放的变换组件',
 *   icon: '🗺️',
 *   category: 'Core 核心',
 *   removable: false
 * })
 * export class TransformComponent extends Component {
 *   @property({
 *     type: 'vector3',
 *     displayName: 'Position 位置',
 *     description: 'Object position in world space 对象在世界空间中的位置'
 *   })
 *   position = { x: 0, y: 0, z: 0 };
 * }
 * ```
 */
function componentDecorator(options: Partial<ComponentMetadata> & { displayName: string }) {
  return function <T extends ComponentType>(target: T): T {
    const metadata: ComponentMetadata = {
      displayName: options.displayName,
      description: options.description,
      icon: options.icon,
      category: options.category,
      removable: options.removable !== false, // Default to true
      addable: options.addable !== false, // Default to true
      order: options.order
    };
    
    componentMetadataMap.set(target, metadata);
    // Register component in global registry when decorated
    // 装饰时在全局注册表中注册组件
    globalComponentRegistry.add(target);
    return target;
  };
}

/**
 * Property decorator - marks a property for editor UI generation
 * 属性装饰器 - 标记属性用于编辑器UI生成
 * 
 * @param options Property metadata options 属性元数据选项
 * 
 * @example
 * ```typescript
 * @property({
 *   type: 'number',
 *   displayName: 'Speed 速度',
 *   description: 'Movement speed 移动速度',
 *   min: 0,
 *   max: 100,
 *   step: 0.1,
 *   category: 'Movement'
 * })
 * speed: number = 10;
 * ```
 */
export function property(options: PropertyMetadata) {
  return function (target: any, propertyKey: string) {
    const componentType = target.constructor as ComponentType;
    
    if (!propertyMetadataMap.has(componentType)) {
      propertyMetadataMap.set(componentType, new Map());
    }
    
    const propertyMap = propertyMetadataMap.get(componentType)!;
    propertyMap.set(propertyKey, options);
  };
}

/**
 * Get component metadata
 * 获取组件元数据
 * 
 * @param componentType Component constructor 组件构造函数
 * @returns Component metadata or undefined 组件元数据或undefined
 */
export function getComponentMetadata(componentType: ComponentType): ComponentMetadata | undefined {
  return componentMetadataMap.get(componentType);
}

/**
 * Get all property metadata for a component
 * 获取组件的所有属性元数据
 * 
 * @param componentType Component constructor 组件构造函数
 * @returns Map of property metadata 属性元数据映射
 */
export function getAllPropertyMetadata(componentType: ComponentType): Map<string, PropertyMetadata> {
  return propertyMetadataMap.get(componentType) || new Map();
}

/**
 * Get property metadata for a specific property
 * 获取特定属性的属性元数据
 * 
 * @param componentType Component constructor 组件构造函数
 * @param propertyName Property name 属性名称
 * @returns Property metadata or undefined 属性元数据或undefined
 */
export function getPropertyMetadata(componentType: ComponentType, propertyName: string): PropertyMetadata | undefined {
  const propertyMap = propertyMetadataMap.get(componentType);
  return propertyMap?.get(propertyName);
}

/**
 * Check if a component has editor metadata
 * 检查组件是否有编辑器元数据
 * 
 * @param componentType Component constructor 组件构造函数
 * @returns True if component has metadata 如果组件有元数据则返回true
 */
export function hasComponentMetadata(componentType: ComponentType): boolean {
  return componentMetadataMap.has(componentType);
}

/**
 * Get all registered component types
 * 获取所有已注册的组件类型
 * 
 * This function uses a global registry to track all decorated components.
 * 此函数使用全局注册表来跟踪所有装饰的组件。
 * 
 * @returns Array of component types 组件类型数组
 */
export function getAllRegisteredComponentTypes(): ComponentType[] {
  // Note: WeakMap doesn't have iteration capabilities, so we maintain a separate registry
  // 注意：WeakMap没有迭代功能，所以我们维护一个单独的注册表
  return Array.from(globalComponentRegistry);
}

// Global component registry for iteration support
// 用于迭代支持的全局组件注册表
const globalComponentRegistry = new Set<ComponentType>();

// Export the component decorator
// 导出组件装饰器
export { componentDecorator as component };

/**
 * Helper function to create property metadata
 * 创建属性元数据的辅助函数
 */
export function createPropertyMetadata(
  type: PropertyMetadata['type'],
  options: Partial<Omit<PropertyMetadata, 'type'>> = {}
): PropertyMetadata {
  return {
    type,
    ...options
  };
}

/**
 * Clear all metadata (for testing)
 * 清除所有元数据（用于测试）
 */
export function clearAllMetadata(): void {
  globalComponentRegistry.clear();
  // Note: We can't clear WeakMaps, but clearing the global registry is sufficient for most purposes
  // 注意：我们无法清除WeakMap，但清除全局注册表对于大多数目的来说已经足够了
}