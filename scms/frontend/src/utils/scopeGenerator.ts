export function generateScope(stories: number, classrooms: number): string {
  if (!stories || !classrooms) return ''
  return `${stories}STY${classrooms}CL`
}