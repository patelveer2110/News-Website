import React, { useState,useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import ResizeImage from "tiptap-extension-resize-image";
import { Mark, mergeAttributes, Extension, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageComponent from "./ResizableImagecomponent.jsx";
import MenuBar from "./Menubar.jsx";

// Custom Highlight with multicolor support
const CustomHighlight = Highlight.extend({
  addOptions() {
    return {
      multicolor: true,
      ...this.parent?.(),
    };
  },
});

// Font Size Extension
const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: ({ size }) => (size ? { style: `font-size: ${size}` } : {}),
      },
    };
  },
  parseHTML() {
    return [{ style: "font-size" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
          ({ chain }) =>
            chain().setMark("fontSize", { size }).run(),
      unsetFontSize:
        () =>
          ({ chain }) =>
            chain().unsetMark("fontSize").run(),
    };
  },
});

const FontFamily = Mark.create({
  name: "fontFamily",
  addAttributes() {
    return {
      font: {
        default: null,
        parseHTML: el => el.style.fontFamily || null,
        renderHTML: attrs => (attrs.font ? { style: `font-family: ${attrs.font}` } : {}),
      },
    };
  },
  parseHTML() {
    return [{ style: "font-family" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontFamily:
        font =>
          ({ chain }) =>
            chain().setMark("fontFamily", { font }).run(),
      unsetFontFamily:
        () =>
          ({ chain }) =>
            chain().unsetMark("fontFamily").run(),
    };
  },
});

// Line Height Extension

const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'], // apply to paragraphs and headings
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (value) =>
          ({ chain }) => {
            const types = this.options.types;
            let chained = chain();
            types.forEach((type) => {
              chained = chained.updateAttributes(type, { lineHeight: value });
            });
            return chained.run();
          },
    };
  },
});

// const ResizableImage = Node.create({
//   name: 'resizableImage',
//   group: 'block',
//   draggable: true,
//   selectable: true,
//   atom: true,

//   addAttributes() {
//     return {
//       src: { default: null },
//       width: { default: '300px' },
//       height: { default: 'auto' },
//     };
//   },

//   parseHTML() {
//     return [{ tag: 'img' }];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return [
//       'img',
//       {
//         ...HTMLAttributes,
//         style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height}; max-width: 100%;`,
//       },
//     ];
//   },

//   addNodeView() {
//     return ({ node, getPos, editor }) => {
//       const container = document.createElement("div");
//       container.contentEditable = false;
//       container.style.position = "relative";
//       container.style.display = "inline-block";
//       container.style.maxWidth = "100%";

//       const img = document.createElement("img");
//       img.src = node.attrs.src;
//       img.style.width = node.attrs.width || "300px";
//       img.style.height = node.attrs.height || "auto";
//       img.style.maxWidth = "100%";
//       img.style.borderRadius = "4px";
//       img.style.display = "block";

//       const resizeHandle = document.createElement("div");
//       resizeHandle.style.width = "10px";
//       resizeHandle.style.height = "10px";
//       resizeHandle.style.background = "#4f46e5";
//       resizeHandle.style.position = "absolute";
//       resizeHandle.style.right = "0";
//       resizeHandle.style.bottom = "0";
//       resizeHandle.style.cursor = "nwse-resize";
//       resizeHandle.style.borderRadius = "2px";

//       let startX, startWidth;

//       resizeHandle.addEventListener("mousedown", (e) => {
//         e.preventDefault();
//         startX = e.clientX;
//         startWidth = img.offsetWidth;

//         const onMouseMove = (e) => {
//           const newWidth = startWidth + (e.clientX - startX);
//           img.style.width = `${newWidth}px`;


//           editor.chain().focus().command(({ tr }) => {
//             try {
//               tr.setNodeMarkup(getPos(), undefined, {
//                 ...node.attrs,
//                 width: `${newWidth}px`,
//               });
//               return true;
//             } catch (err) {
//               console.error("Resize failed", err);
//               return false;
//             }
//           }).run();
//         };

//         const onMouseUp = () => {
//           document.removeEventListener("mousemove", onMouseMove);
//           document.removeEventListener("mouseup", onMouseUp);
//         };

//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//       });

//       container.appendChild(img);
//       container.appendChild(resizeHandle);

//       return {
//         dom: container,
//         contentDOM: null,
//       };
//     };
//   },
// });



 const ResizableImage = Node.create({
  name: 'resizableImage',

  group: 'block',
  inline: false,
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '300px',
      },
      height: {
        default: 'auto',
      },
      alignment: {
        default: 'center', // left | center | right
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          return { 'data-align': attributes.alignment };
        }
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-type="resizable-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { 'data-type': 'resizable-image' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

const TiptapEditor = ({ content, onChange }) => {
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [bulletStyle, setBulletStyle] = useState("disc");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false }),
      Heading.configure({ leqvels: [1, 2, 3] }),
      Underline,
      Link,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      CustomHighlight,
      Subscript,
      Superscript,
      TextStyle.configure({
        types: ["textStyle"],
      }),
      Color,
      BulletList,
      OrderedList,
      ListItem,
      FontSize,
      FontFamily,
      LineHeight,
      ResizableImage,  // Uncomment if you want to use the custom ResizableImage extension
      // ResizeImage.configure({
      // inline: false,
      // allowBase64: true,  // Important to show uploaded image from local device immediately
      // HTMLAttributes: {
      //   class: 'resizable-image',
      // },
    // }),
      // ResizableImage,
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const handleStyleChange = (type, value) => {
    if (!editor) return;

    switch (type) {
      case "highlight":
        setHighlightColor(value);
        editor.chain().focus().setHighlight({ color: value }).run();
        break;
      case "fontSize":
        setFontSize(value);
        editor.chain().focus().setFontSize(value).run();
        break;
      case "fontFamily":
        setFontFamily(value);
        editor.chain().focus().setMark("textStyle", { style: `font-family: ${value}` }).run();
        break;
      case "bulletStyle":
        setBulletStyle(value);
        const ul = document.querySelector(".ProseMirror ul");
        if (ul) ul.style.listStyleType = value;
        break;
    }
  };
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);
 return (
 <div className="max-w-4xl mx-auto p-4 bg-base-200 rounded-xl shadow-lg border border-base-300 flex flex-col">
  {/* MenuBar */}
  <div className="mb-4 border-b border-base-300 pb-2 flex flex-wrap gap-2 select-none menubar">
    <MenuBar editor={editor} />
  </div>

  <EditorContent
    editor={editor}
    placeholder="Start typing..."
    className="prose prose-sm prose-indigo dark:prose-invert min-h-[280px] p-4 bg-base-100 rounded-lg border border-base-300 shadow-inner focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-opacity-50 overflow-y-auto max-h-[450px]"
    style={{ fontFamily, fontSize, lineHeight: "1.6" }}
  />
{/* </div> */}

    
    <style jsx>{`
      .menubar {
        /* Optional: keep your custom menubar styles if needed */
      }
    

      // .ProseMirror ul {
      //   list-style-type: ${bulletStyle} !important;
      // }
      // .ProseMirror ol {
      //   list-style-type: decimal !important;
      // }
      /* Headings spacing */
      // .prose h1 {
      // font-size : 30px;
      //   margin-top: 1.5rem;
      //   margin-bottom: 1rem;
      // }
      // .prose h2 {
      // font-size : 24px;
      //   margin-top: 1.25rem;
      //   margin-bottom: 0.75rem;
      // }
      // .prose h3 {
      // font-size : 20px;
      //   margin-top: 1rem;
      //   margin-bottom: 0.5rem;
      // }
      // /* Paragraph text alignment */
      // .prose p {
      // font-size : 14px;
      //   text-align: justify;
      // }
    `}</style>
  </div>
);

};

export default TiptapEditor;
