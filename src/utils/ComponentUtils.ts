/**
 * Component utilities for editor integration
 * 编辑器集成的组件实用工具
 */

import type { ComponentType } from '@esengine/nova-ecs';
import { getEditorComponentRegistry, type ComponentRegistration } from '../plugins/EditorComponentPlugin';
import type { ComponentMetadata, PropertyMetadata } from '../decorators/component';

/**
 * Helper function to create component metadata
 * 创建组件元数据的辅助函数
 */
export function createComponentMetadata(
  displayName: string,
  _properties: Record<string, PropertyMetadata>,
  options: Partial<Omit<ComponentMetadata, 'displayName'>> = {}
): ComponentMetadata {
  return {
    displayName,
    removable: true,
    addable: true,
    ...options
  };
}

/**
 * Get all available component types for the add component UI
 * 获取所有可用的组件类型用于添加组件UI
 */
export function getAvailableComponentTypes(): Array<{
  componentType: ComponentType;
  registration: ComponentRegistration;
}> {
  const registry = getEditorComponentRegistry();
  return registry.getAddable()
    .map(registration => ({
      componentType: registration.componentType,
      registration
    }))
    .sort((a, b) => (a.registration.metadata.order || 999) - (b.registration.metadata.order || 999));
}

/**
 * Get component registration by type
 * 按类型获取组件注册
 */
export function getComponentRegistration(componentType: ComponentType): ComponentRegistration | undefined {
  const registry = getEditorComponentRegistry();
  return registry.get(componentType);
}

/**
 * Check if a component type is registered for editor use
 * 检查组件类型是否已注册供编辑器使用
 */
export function isComponentRegistered(componentType: ComponentType): boolean {
  const registry = getEditorComponentRegistry();
  return registry.has(componentType);
}

/**
 * Get components grouped by category
 * 获取按类别分组的组件
 */
export function getComponentsByCategory(): Record<string, ComponentRegistration[]> {
  const registry = getEditorComponentRegistry();
  const components = registry.getAll();
  const grouped: Record<string, ComponentRegistration[]> = {};
  
  for (const registration of components) {
    const category = registration.metadata.category || 'Uncategorized 未分类';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(registration);
  }
  
  // Sort components within each category by order
  // 按顺序对每个类别中的组件进行排序
  for (const category in grouped) {
    grouped[category].sort((a, b) => (a.metadata.order || 999) - (b.metadata.order || 999));
  }
  
  return grouped;
}

/**
 * Get component display name with fallback
 * 获取组件显示名称（带后备）
 */
export function getComponentDisplayName(componentType: ComponentType): string {
  const registration = getComponentRegistration(componentType);
  return registration?.metadata.displayName || componentType.name;
}

/**
 * Get component icon with fallback
 * 获取组件图标（带后备）
 */
export function getComponentIcon(componentType: ComponentType): string {
  const registration = getComponentRegistration(componentType);
  return registration?.metadata.icon || '📦';
}

/**
 * Get component category with fallback
 * 获取组件类别（带后备）
 */
export function getComponentCategory(componentType: ComponentType): string {
  const registration = getComponentRegistration(componentType);
  return registration?.metadata.category || 'Uncategorized 未分类';
}

/**
 * Check if component can be removed
 * 检查组件是否可以移除
 */
export function canRemoveComponent(componentType: ComponentType): boolean {
  const registration = getComponentRegistration(componentType);
  return registration?.metadata.removable !== false;
}

/**
 * Check if component can be added via UI
 * 检查组件是否可以通过UI添加
 */
export function canAddComponent(componentType: ComponentType): boolean {
  const registration = getComponentRegistration(componentType);
  return registration?.metadata.addable !== false;
}

/**
 * Get property metadata for a component property
 * 获取组件属性的属性元数据
 */
export function getPropertyMetadata(componentType: ComponentType, propertyName: string): PropertyMetadata | undefined {
  const registration = getComponentRegistration(componentType);
  return registration?.properties.get(propertyName);
}

/**
 * Get all property metadata for a component
 * 获取组件的所有属性元数据
 */
export function getAllPropertyMetadata(componentType: ComponentType): Map<string, PropertyMetadata> {
  const registration = getComponentRegistration(componentType);
  return registration?.properties || new Map();
}

/**
 * Get properties grouped by category
 * 获取按类别分组的属性
 */
export function getPropertiesByCategory(componentType: ComponentType): Record<string, Array<[string, PropertyMetadata]>> {
  const properties = getAllPropertyMetadata(componentType);
  const grouped: Record<string, Array<[string, PropertyMetadata]>> = {};
  
  for (const [propertyName, metadata] of properties.entries()) {
    const category = metadata.category || 'General 通用';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push([propertyName, metadata]);
  }
  
  // Sort properties within each category by order
  // 按顺序对每个类别中的属性进行排序
  for (const category in grouped) {
    grouped[category].sort((a, b) => (a[1].order || 999) - (b[1].order || 999));
  }
  
  return grouped;
}

/**
 * Get registry statistics
 * 获取注册表统计信息
 */
export function getRegistryStatistics(): {
  totalComponents: number;
  addableComponents: number;
  removableComponents: number;
  categorizedComponents: Record<string, number>;
  componentsByCategory: Record<string, string[]>;
} {
  const registry = getEditorComponentRegistry();
  const stats = registry.getStatistics();
  const components = registry.getAll();
  
  let removableCount = 0;
  const componentsByCategory: Record<string, string[]> = {};
  
  for (const registration of components) {
    if (registration.metadata.removable !== false) {
      removableCount++;
    }
    
    const category = registration.metadata.category || 'Uncategorized 未分类';
    if (!componentsByCategory[category]) {
      componentsByCategory[category] = [];
    }
    componentsByCategory[category].push(registration.metadata.displayName);
  }
  
  return {
    ...stats,
    removableComponents: removableCount,
    componentsByCategory
  };
}