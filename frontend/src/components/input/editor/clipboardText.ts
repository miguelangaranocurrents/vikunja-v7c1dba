import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

const ITEM_NODES = new Set(['listItem', 'taskItem'])

/**
 * Plain text for copies out of the editor. ProseMirror's default serializer drops list
 * markers, so a copied bullet list pastes as bare lines. Each list item gets its marker
 * ("- ", "1. "), and nested content is indented under it.
 */
export function serializeFragmentToText(fragment: Fragment): string {
	return fragmentLines(fragment).join('\n')
}

function fragmentLines(fragment: Fragment, parentName = ''): string[] {
	const lines: string[] = []
	let index = 0

	fragment.forEach(node => {
		if (ITEM_NODES.has(node.type.name)) {
			const marker = parentName === 'orderedList' ? `${index + 1}. ` : '- '
			lines.push(...itemLines(node, marker))
			index++
			return
		}

		if (node.isTextblock) {
			lines.push(node.textContent)
			return
		}

		lines.push(...fragmentLines(node.content, node.type.name))
	})

	return lines
}

function itemLines(item: ProseMirrorNode, marker: string): string[] {
	const inner = fragmentLines(item.content)
	if (inner.length === 0) {
		return [marker.trimEnd()]
	}

	const indent = ' '.repeat(marker.length)
	return inner.map((line, i) => (i === 0 ? marker : indent) + line)
}
