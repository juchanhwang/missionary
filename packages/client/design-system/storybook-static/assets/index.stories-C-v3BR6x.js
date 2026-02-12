import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{a as q}from"./utils-CkYB-R1u.js";import{c as A}from"./index-DwflgHml.js";const R=A("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring whitespace-nowrap",{variants:{variant:{success:"border-transparent bg-green-10 text-green-60",warning:"border-transparent bg-warning-10 text-warning-70",info:"border-transparent bg-blue-10 text-blue-60",default:"border-transparent bg-gray-80 text-white hover:bg-gray-70",destructive:"border-transparent bg-primary-50 text-white hover:bg-primary-60",outline:"border-gray-30 bg-transparent text-gray-80 hover:bg-gray-10"}},defaultVariants:{variant:"default"}});function e({variant:E,children:W,className:_}){return r.jsx("span",{className:q(R({variant:E}),_),children:W})}e.displayName="Badge";e.__docgenInfo={description:"",methods:[],displayName:"Badge",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""}},composes:["VariantProps"]};const k={component:e,title:"Components/Badge",parameters:{layout:"centered"},tags:["autodocs"]},a={render:()=>r.jsx(e,{variant:"success",children:"입금완료"})},n={render:()=>r.jsx(e,{variant:"warning",children:"입금전 (D-1)"})},t={render:()=>r.jsx(e,{variant:"info",children:"100,000₩"})},s={render:()=>r.jsx(e,{variant:"default",children:"Default"})},i={render:()=>r.jsx(e,{variant:"destructive",children:"Error"})},o={render:()=>r.jsx(e,{variant:"outline",children:"Outline"})},d={render:()=>r.jsxs("div",{className:"flex flex-wrap gap-2",children:[r.jsx(e,{variant:"success",children:"Success"}),r.jsx(e,{variant:"warning",children:"Warning"}),r.jsx(e,{variant:"info",children:"Info"}),r.jsx(e,{variant:"default",children:"Default"}),r.jsx(e,{variant:"destructive",children:"Destructive"}),r.jsx(e,{variant:"outline",children:"Outline"})]})};var c,u,g;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <Badge variant="success">입금완료</Badge>
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var l,p,m;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Badge variant="warning">입금전 (D-1)</Badge>
}`,...(m=(p=n.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var v,f,x;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <Badge variant="info">100,000₩</Badge>
}`,...(x=(f=t.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var B,h,b;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <Badge variant="default">Default</Badge>
}`,...(b=(h=s.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var j,w,y;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <Badge variant="destructive">Error</Badge>
}`,...(y=(w=i.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var D,S,N;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Badge variant="outline">Outline</Badge>
}`,...(N=(S=o.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var O,I,V;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="default">Default</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
}`,...(V=(I=d.parameters)==null?void 0:I.docs)==null?void 0:V.source}}};const z=["Success","Warning","Info","Default","Destructive","Outline","AllVariants"];export{d as AllVariants,s as Default,i as Destructive,t as Info,o as Outline,a as Success,n as Warning,z as __namedExportsOrder,k as default};
