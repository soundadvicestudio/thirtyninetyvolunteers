import type { IOptions } from 'sanitize-html'

export const FORUM_POST_SANITIZE_OPTIONS: IOptions = {
  allowedTags: ['p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'blockquote', 'a', 'hr', 'pre', 'code'],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
}
