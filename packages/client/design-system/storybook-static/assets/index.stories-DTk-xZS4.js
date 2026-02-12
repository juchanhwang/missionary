import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{a as b}from"./utils-CkYB-R1u.js";import{c as z}from"./index-DwflgHml.js";const S=z("inline-flex items-center gap-1 rounded-2xl transition-colors whitespace-nowrap",{variants:{variant:{default:"bg-gray-10 text-gray-80",accent:"bg-gray-80 text-white",outline:"border border-gray-30 bg-transparent text-gray-80"},size:{sm:"px-2 py-1 text-xs",md:"px-3 py-1.5 text-sm"}},defaultVariants:{variant:"default",size:"md"}});function s({children:f,variant:C,size:j,onDismiss:n,className:D}){return e.jsxs("span",{className:b(S({variant:C,size:j}),D),children:[f,n&&e.jsx("button",{type:"button",onClick:n,className:"ml-1 rounded-full hover:bg-gray-10 p-0.5","aria-label":"Remove",children:e.jsx("svg",{className:"h-3 w-3",viewBox:"0 0 12 12",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",children:e.jsx("path",{d:"M9.5 3.5L3.5 9.5M3.5 3.5L9.5 9.5"})})})]})}s.displayName="Chips";s.__docgenInfo={description:"",methods:[],displayName:"Chips",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},onDismiss:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}},composes:["VariantProps"]};const V={component:s,title:"Components/Chips",parameters:{layout:"centered"},tags:["autodocs"]},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx(s,{children:"태그1"}),e.jsx(s,{children:"태그2"}),e.jsx(s,{children:"필터"})]})},r={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:[e.jsx(s,{variant:"default",children:"Default"}),e.jsx(s,{variant:"accent",children:"Accent"}),e.jsx(s,{variant:"outline",children:"Outline"})]})},a={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(s,{size:"sm",children:"Small"}),e.jsx(s,{size:"md",children:"Medium"})]})},t={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx(s,{onDismiss:()=>alert("Dismissed!"),children:"Dismissible"}),e.jsx(s,{variant:"accent",onDismiss:()=>alert("Dismissed!"),children:"Accent"}),e.jsx(s,{variant:"outline",size:"sm",onDismiss:()=>alert("Dismissed!"),children:"Small Outline"})]})};var l,p,d;i.parameters={...i.parameters,docs:{...(l=i.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px'
  }}>
      <Chips>태그1</Chips>
      <Chips>태그2</Chips>
      <Chips>필터</Chips>
    </div>
}`,...(d=(p=i.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var o,c,m;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }}>
      <Chips variant="default">Default</Chips>
      <Chips variant="accent">Accent</Chips>
      <Chips variant="outline">Outline</Chips>
    </div>
}`,...(m=(c=r.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var h,u,x;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Chips size="sm">Small</Chips>
      <Chips size="md">Medium</Chips>
    </div>
}`,...(x=(u=a.parameters)==null?void 0:u.docs)==null?void 0:x.source}}};var g,v,y;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px'
  }}>
      <Chips onDismiss={() => alert('Dismissed!')}>Dismissible</Chips>
      <Chips variant="accent" onDismiss={() => alert('Dismissed!')}>
        Accent
      </Chips>
      <Chips variant="outline" size="sm" onDismiss={() => alert('Dismissed!')}>
        Small Outline
      </Chips>
    </div>
}`,...(y=(v=t.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};const W=["Default","Variants","Sizes","WithDismiss"];export{i as Default,a as Sizes,r as Variants,t as WithDismiss,W as __namedExportsOrder,V as default};
