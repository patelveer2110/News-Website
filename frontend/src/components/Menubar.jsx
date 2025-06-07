import React, { useRef, useState } from "react";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, SubscriptIcon, SuperscriptIcon,
  ImageIcon, Droplet
} from "lucide-react";
import { FaFont } from "react-icons/fa";

const Button = ({ onClick, active, icon: Icon, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`btn btn-sm ${active ? "btn-primary" : "btn-ghost"}`}
  >
    <Icon size={16} />
  </button>
);

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [bulletStyle, setBulletStyle] = useState("disc");
  const [orderedStyle, setOrderedStyle] = useState("decimal");
  const [fontColor, setFontColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");

  if (!editor) return null;

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
    updateBulletStyle(bulletStyle);
  };

  const updateBulletStyle = (style) => {
    setBulletStyle(style);
    const el = editor.view.dom;
    el.classList.remove("bullet-disc", "bullet-circle", "bullet-square");
    el.classList.add(`bullet-${style}`);
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
    updateOrderedStyle(orderedStyle);
  };

  const updateOrderedStyle = (style) => {
    setOrderedStyle(style);
    const el = editor.view.dom;
    el.classList.remove("ordered-decimal", "ordered-lower-alpha", "ordered-lower-roman");
    el.classList.add(`ordered-${style}`);
  };

  const onImageButtonClick = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      if (!base64) {
        alert('Failed to load image.');
        return;
      }

      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: {
          src: base64,
          width: '300px',
          height: 'auto',
          alignment: 'center',
        },
      }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const applyFontFamily = (font) => {
    editor.chain().focus().setFontFamily(font).run();
    setFontFamily(font);
  };

  const applyFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
  };

  const applyLineHeight = (lineHeight) => {
    editor.chain().focus().setLineHeight(lineHeight).run();
  };

  const applyFontColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setFontColor(color);
  };

  const applyAlignment = (value) => {
    editor.chain().focus().setTextAlign(value).run();

    // Also apply to selected image nodes
    const { from, to } = editor.state.selection;
    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'resizableImage') {
        editor.chain().focus().command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            alignment: value
          });
          return true;
        }).run();
      }
    });
  };
    const applyHeading = (value) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value);
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };


return (
  <div className="flex flex-wrap gap-2 items-center bg-base-200 p-3 rounded-lg shadow">

    {/* Basic text formatting */}
    <Button icon={Bold} title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
    <Button icon={Italic} title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
    <Button icon={Underline} title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />

    {/* Headings dropdown */}
    <select
      title="Headings"
      onChange={(e) => applyHeading(e.target.value)}
      className="select select-sm border rounded text-sm w-[7.5rem]"
      defaultValue=""
    >
      <option value="" disabled>Headings</option>
      <option value="paragraph">Paragraph</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
    </select>

    {/* Lists */}
    <Button icon={List} title={`Bullet List (${bulletStyle})`} active={editor.isActive("bulletList")} onClick={toggleBulletList} />
    {editor.isActive("bulletList") && (
      <select
        value={bulletStyle}
        onChange={(e) => updateBulletStyle(e.target.value)}
        className="select select-sm border rounded text-sm"
        title="Bullet List Style"
      >
        <option value="disc">• Disc</option>
        <option value="circle">◦ Circle</option>
        <option value="square">▪ Square</option>
      </select>
    )}

    <Button icon={ListOrdered} title={`Ordered List (${orderedStyle})`} active={editor.isActive("orderedList")} onClick={toggleOrderedList} />
    {editor.isActive("orderedList") && (
      <select
        value={orderedStyle}
        onChange={(e) => updateOrderedStyle(e.target.value)}
        className="select select-sm border rounded text-sm"
        title="Ordered List Style"
      >
        <option value="decimal">1, 2, 3</option>
        <option value="lower-alpha">a, b, c</option>
        <option value="lower-roman">i, ii, iii</option>
      </select>
    )}

    {/* Subscript & Superscript */}
    <Button icon={SubscriptIcon} title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} />
    <Button icon={SuperscriptIcon} title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} />

    {/* Alignment */}
    <select
      title="Alignment"
      onChange={(e) => applyAlignment(e.target.value)}
      className="select select-sm border rounded text-sm w-[8rem]"
      defaultValue=""
    >
      <option value="" disabled>Align</option>
      <option value="left">Left</option>
      <option value="center">Center</option>
      <option value="right">Right</option>
      <option value="justify">Justify</option>
    </select>

    {/* Font styling group */}
    <select
      title="Font Family"
      onChange={(e) => applyFontFamily(e.target.value)}
      className="select select-sm border rounded text-sm w-[9rem]"
      defaultValue=""
    >
      <option value="" disabled>Font Family</option>
      <option value="Arial">Arial</option>
      <option value="'Courier New', Courier">Courier New</option>
      <option value="'Times New Roman', Times">Times New Roman</option>
      <option value="'Comic Sans MS', cursive">Comic Sans</option>
      <option value="'Georgia', serif">Georgia</option>
      <option value="'Roboto', sans-serif">Roboto</option>
    </select>

    <select
      title="Font Size"
      onChange={(e) => applyFontSize(e.target.value)}
      className="select select-sm border rounded text-sm w-[7rem]"
      defaultValue=""
    >
      <option value="" disabled>Font Size</option>
      <option value="12px">12px</option>
      <option value="16px">16px</option>
      <option value="20px">20px</option>
      <option value="24px">24px</option>
      <option value="32px">32px</option>
    </select>

    <select
      title="Line Spacing"
      onChange={(e) => applyLineHeight(e.target.value)}
      className="select select-sm border rounded text-sm w-[7rem]"
      defaultValue=""
    >
      <option value="" disabled>Line Spacing</option>
      <option value="0.5">0.5</option>
      <option value="1">1</option>
      <option value="1.25">1.25</option>
      <option value="1.5">1.5</option>
      <option value="2">2</option>
    </select>

    {/* Font Color Picker */}
    <label
      htmlFor="fontColorInput"
      className="flex flex-col items-center gap-1 cursor-pointer"
      title="Font Color"
    >
      <FaFont className="text-xl" />
      <div
        className="w-6 h-1 rounded-sm"
        style={{ backgroundColor: fontColor }}
      />
      <input
        id="fontColorInput"
        type="color"
        value={fontColor}
        onChange={(e) => applyFontColor(e.target.value)}
        className="w-0 h-0 opacity-0 absolute"
      />
    </label>

    {/* Image Upload */}
    <Button icon={ImageIcon} title="Upload Image" onClick={onImageButtonClick} />
    <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />

  </div>
);

};

export default MenuBar;
