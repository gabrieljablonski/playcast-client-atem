import * as fs from 'fs';
import { stringify } from './general';

export function loadFile(
  path: string,
  asObject = true,
): { contents?: Record<string, unknown> | string; error?: any } {
  try {
    const contents = fs.readFileSync(path).toString();
    return { contents: asObject ? JSON.parse(contents) : contents };
  } catch (error) {
    return { error };
  }
}

export function saveFile(
  path: string,
  data: string | Record<string, unknown>,
  indent?: number,
): { error?: any } {
  let contents = '';
  if (typeof data === 'string') {
    contents = data;
  }
  if (typeof data === 'object') {
    contents = stringify(data, indent);
  }
  try {
    fs.writeFileSync(path, contents);
    return {};
  } catch (error) {
    return { error };
  }
}
