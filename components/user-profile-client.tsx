'use client';
/**
 * components/user-profile-client.tsx
 * Instagram-style user profile with UserPaintedCanvas artistic header.
 * Updated March 2026.
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, Heart, ImageIcon, PenSquare, MessageSquare, Repeat2, Share2, ExternalLink } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { UserPaintedCanvas } from './community/user-painted-canvas';
import type { CommunityPostWithRepost } from '@/lib/db-server';

interface UserData { id:string; username:string|null; fullName:string|null; firstName:string|null; lastName:string|null; imageUrl:string; createdAt:number; publicMetadata:Record<string,unknown>; }
interface Stats { postCount:number; likesReceived:number; imagePosts:number; }
interface Props { user:UserData; posts:CommunityPostWithRepost[]; isOwnProfile:boolean; stats:Stats; }

function timeAgo(d:string|Date):string{const s=(Date.now()-new Date(d).getTime())/1000;if(s<60)return 'just now';if(s<3600)return `${Math.floor(s/60)}m`;if(s<86400)return `${Math.floor(s/3600)}h`;if(s<604800)return `${Math.floor(s/86400)}d`;return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
function formatJoinDate(ms:number):string{return new Date(ms).toLocaleDateString('en-US',{month:'short',year:'numeric'});}

function GridItem({post,username}:{post:CommunityPostWithRepost;username:string}){
  const href=`/${username}/community/${post.slug??post.id}`;
  return(
    <Link href={href} className="group block">
      <motion.div whileHover={{scale:1.03}} transition={{type:'spring',stiffness:380,damping:25}} className="relative aspect-square bg-accent-subtle rounded-xl overflow-hidden">
        {post.imageUrl?<Image src={post.imageUrl} alt="Post" fill className="object-cover" sizes="(max-width:640px) 33vw,200px" />:<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20 p-3"><p className="text-xs text-foreground/60 text-center line-clamp-4 font-medium">{post.content}</p></div>}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex items-center gap-3 text-white text-sm font-semibold"><span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" />{post.likesCount}</span><span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post.commentsCount}</span></div></div>
      </motion.div>
    </Link>
  );
}

function ListItem({post,username}:{post:CommunityPostWithRepost;username:string}){
  const href=`/${username}/community/${post.slug??post.id}`;
  const [cp,setCp]=useState(false);
  const share=async(e:React.MouseEvent)=>{e.preventDefault();const url=`${window.location.origin}/community/${post.slug??post.id}`;try{if(navigator.share){await navigator.share({title:`${post.authorName} on SR Arts`,url});}else{await navigator.clipboard.writeText(url);setCp(true);setTimeout(()=>setCp(false),2000);toast.success('Link copied!');}void fetch(`/api/community/${post.id}/share`,{method:'POST'});}catch{/*cancelled*/}};
  return(
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {post.repostOfId&&<div className="px-4 pt-3 pb-0 flex items-center gap-1.5 text-xs text-muted-foreground"><Repeat2 className="w-3.5 h-3.5 text-green-500" /><span className="font-medium text-green-600">Reposted</span></div>}
      <Link href={href} className="block px-4 pt-3 pb-3 group"><p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground line-clamp-4 whitespace-pre-wrap">{post.content}</p>{post.imageUrl&&<div className="relative mt-3 w-full aspect-video rounded-xl overflow-hidden bg-accent-subtle"><Image src={post.imageUrl} alt="Post" fill className="object-cover" sizes="(max-width:640px) 100vw,600px" /></div>}</Link>
      <div className="px-4 py-2.5 border-t border-border/50 flex items-center gap-1 text-muted-foreground">
        <span className="text-xs mr-auto">{timeAgo(post.createdAt)}</span>
        <span className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs"><Heart className="w-3.5 h-3.5" />{post.likesCount}</span>
        <span className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs"><MessageSquare className="w-3.5 h-3.5" />{post.commentsCount}</span>
        <span className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs"><Repeat2 className="w-3.5 h-3.5" />{post.repostsCount}</span>
        <button onClick={e=>void share(e)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent-subtle transition-colors"><Share2 className={`w-3.5 h-3.5 ${cp?'text-green-500':''}`} /></button>
        <Link href={href} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent-subtle hover:text-primary transition-colors"><ExternalLink className="w-3.5 h-3.5" /></Link>
      </div>
    </motion.div>
  );
}

function EmptyState({icon,message,sub,isOwnProfile}:{icon:React.ReactNode;message:string;sub?:string;isOwnProfile?:boolean}){
  return(
    <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} className="text-center py-20 bg-white border border-border rounded-2xl">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="font-semibold text-foreground/70 mb-1">{message}</p>
      {sub&&<p className="text-sm text-muted-foreground">{sub}</p>}
      {isOwnProfile&&<Link href="/community" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors"><PenSquare className="w-4 h-4" />Create a Post</Link>}
    </motion.div>
  );
}

export function UserProfileClient({user,posts,isOwnProfile,stats}:Props){
  const [view,setView]=useState<'grid'|'list'>('list');
  const username=user.username??user.id;
  const displayName=user.fullName??user.firstName??username;
  const imagePosts=posts.filter(p=>p.imageUrl);

  return(
    <div className="pt-20 pb-20">
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:24}} className="mb-6">
            <UserPaintedCanvas username={username} displayName={displayName} profileImage={user.imageUrl||null} joinDate={user.createdAt?formatJoinDate(user.createdAt):''} postCount={stats.postCount} likesCount={stats.likesReceived} handle={`@${username}`} width={560} height={300} className="w-full max-w-sm mx-auto md:max-w-none" />
          </motion.div>
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-2xl font-extrabold">{displayName}</h1><p className="text-sm text-muted-foreground">@{username}</p></div>
            <div className="flex items-center gap-3">
              {isOwnProfile&&<><UserButton afterSignOutUrl="/" /><Link href="/user-profile" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-accent-subtle hover:border-primary hover:text-primary transition-all"><PenSquare className="w-3.5 h-3.5" />Edit Profile</Link></>}
              {!isOwnProfile&&<Link href="/community" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">View Community</Link>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">{isOwnProfile?'Your Posts':`${user.firstName??'Their'}'s Posts`}</h2>
          <div className="flex items-center gap-1 p-1 bg-white border border-border rounded-xl">
            {([['list',List],['grid',Grid3X3]] as const).map(([v,Icon])=>(
              <button key={v} onClick={()=>setView(v)} className={`p-2 rounded-lg transition-all ${view===v?'bg-primary text-white shadow-sm':'text-muted-foreground hover:bg-accent-subtle'}`} aria-label={`${v} view`}><Icon className="w-4 h-4" /></button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {view==='grid'&&(
            <motion.div key="grid" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {imagePosts.length===0?<EmptyState icon={<ImageIcon className="w-10 h-10 text-muted-foreground/40" />} message="No photo posts yet" sub={isOwnProfile?"Share your first artwork!":undefined} isOwnProfile={isOwnProfile} />:<div className="grid grid-cols-3 gap-1.5 sm:gap-2">{imagePosts.map(p=><GridItem key={p.id} post={p} username={username} />)}</div>}
            </motion.div>
          )}
          {view==='list'&&(
            <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              {posts.length===0?<EmptyState icon={<MessageSquare className="w-10 h-10 text-muted-foreground/40" />} message="No posts yet" sub={isOwnProfile?"Share something!":"Nothing posted yet."} isOwnProfile={isOwnProfile} />:posts.map((p,i)=>(
                <motion.div key={p.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}><ListItem post={p} username={username} /></motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
