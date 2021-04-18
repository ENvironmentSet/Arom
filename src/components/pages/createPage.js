export function createPage(component, name, path = `/${name}`) {
  Reflect.defineProperty(component, 'name', { value: name });
  component.path = path;

  return component;
}
