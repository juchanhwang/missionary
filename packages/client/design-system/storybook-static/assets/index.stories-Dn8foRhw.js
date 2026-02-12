import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{a as C}from"./utils-CkYB-R1u.js";import{c as P}from"./index-DwflgHml.js";const W=P("rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{ghost:"bg-transparent hover:bg-gray-10",filled:"bg-gray-80 text-white hover:bg-gray-70",outline:"border border-gray-30 bg-transparent hover:bg-gray-10"},size:{sm:"h-8",md:"h-10",lg:"h-12"}},defaultVariants:{variant:"ghost",size:"md"}}),E={sm:"w-8",md:"w-10",lg:"w-12"};function s({icon:a,label:u,size:m="md",variant:F="ghost",className:T,..._}){const p=!!u;return e.jsxs("button",{className:C(W({variant:F,size:m}),p?"w-auto px-3 gap-1":E[m],T),..._,children:[a,p&&e.jsx("span",{className:"text-sm font-medium",children:u})]})}s.__docgenInfo={description:"",methods:[],displayName:"IconButton",props:{icon:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},label:{required:!1,tsType:{name:"string"},description:""},size:{defaultValue:{value:"'md'",computed:!1},required:!1},variant:{defaultValue:{value:"'ghost'",computed:!1},required:!1}},composes:["ButtonHTMLAttributes","VariantProps"]};const r=()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8"}),e.jsx("path",{d:"m21 21-4.3-4.3"})]}),M={title:"Components/IconButton",component:s,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","md","lg"]},variant:{control:{type:"select"},options:["filled","ghost","outline"]},label:{control:{type:"text"}}}},n={args:{icon:e.jsx(r,{})}},t={args:{icon:e.jsx(r,{}),label:"Search"}},o={render:a=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(s,{...a,size:"sm"}),e.jsx(s,{...a,size:"md"}),e.jsx(s,{...a,size:"lg"})]}),args:{icon:e.jsx(r,{})}},i={render:a=>e.jsxs("div",{className:"flex items-center gap-4 p-4 rounded",children:[e.jsx(s,{...a,variant:"ghost",label:"Ghost"}),e.jsx(s,{...a,variant:"filled",label:"Filled"}),e.jsx(s,{...a,variant:"outline",label:"Outline"})]}),args:{icon:e.jsx(r,{})}},c={args:{icon:e.jsx(r,{}),variant:"filled"}},l={args:{icon:e.jsx(r,{}),variant:"outline"}},d={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(s,{icon:e.jsx(r,{}),variant:"ghost",disabled:!0}),e.jsx(s,{icon:e.jsx(r,{}),variant:"filled",disabled:!0}),e.jsx(s,{icon:e.jsx(r,{}),variant:"outline",disabled:!0})]})};var g,h,x;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    icon: <SearchIcon />
  }
}`,...(x=(h=n.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var v,f,b;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    icon: <SearchIcon />,
    label: 'Search'
  }
}`,...(b=(f=t.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var j,I,S;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: (args: IconButtonProps) => <div className="flex items-center gap-4">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>,
  args: {
    icon: <SearchIcon />
  }
}`,...(S=(I=o.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};var B,y,w;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: (args: IconButtonProps) => <div className="flex items-center gap-4 p-4 rounded">
      <IconButton {...args} variant="ghost" label="Ghost" />
      <IconButton {...args} variant="filled" label="Filled" />
      <IconButton {...args} variant="outline" label="Outline" />
    </div>,
  args: {
    icon: <SearchIcon />
  }
}`,...(w=(y=i.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var z,N,V;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    icon: <SearchIcon />,
    variant: 'filled'
  }
}`,...(V=(N=c.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var L,q,O;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    icon: <SearchIcon />,
    variant: 'outline'
  }
}`,...(O=(q=l.parameters)==null?void 0:q.docs)==null?void 0:O.source}}};var R,k,D;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <IconButton icon={<SearchIcon />} variant="ghost" disabled />
      <IconButton icon={<SearchIcon />} variant="filled" disabled />
      <IconButton icon={<SearchIcon />} variant="outline" disabled />
    </div>
}`,...(D=(k=d.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};const J=["Default","WithLabel","Sizes","Variants","Filled","Outline","Disabled"];export{n as Default,d as Disabled,c as Filled,l as Outline,o as Sizes,i as Variants,t as WithLabel,J as __namedExportsOrder,M as default};
