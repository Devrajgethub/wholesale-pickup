import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const images: Record<string, string> = {
  "cmqvr84qz000bpauzbh2nikh2": "https://sfile.chatglm.cn/images-ppt/dbd2832b14f7.jpg",
  "cmqvr84r0000dpauzjo0sftay": "https://sfile.chatglm.cn/images-ppt/412bdb4fff7d.jpg",
  "cmqvr84r2000fpauzqm3dsi61": "https://sfile.chatglm.cn/images-ppt/1324f8ea9543.jpg",
  "cmqvr84r3000hpauzn4cqnzf5": "https://sfile.chatglm.cn/images-ppt/bd5221ef8847.jpg",
  "cmqvr84r4000jpauzak472v84": "https://sfile.chatglm.cn/images-ppt/5ef24dda634b.jpg",
  "cmqvr84r5000lpauz9830nm1n": "https://sfile.chatglm.cn/images-ppt/1b28910d532c.jpg",
  "cmqvr84r6000npauzs74jm9gp": "https://sfile.chatglm.cn/images-ppt/93ebe134f3a1.jpeg",
  "cmqvr84r7000ppauzho6o6d2h": "https://sfile.chatglm.cn/images-ppt/20a2e58ccbc4.jpeg",
  "cmqvr84r8000rpauzex5vmr60": "https://sfile.chatglm.cn/images-ppt/0cf31d0d365d.jpg",
  "cmqvr84r9000tpauzj4uxdhec": "https://sfile.chatglm.cn/images-ppt/54f521f820ea.jpg",
  "cmqvr84ra000vpauzcrwli7k8": "https://sfile.chatglm.cn/images-ppt/80e7ce1092ea.png",
  "cmqvr84rb000xpauzfs5ckr0i": "https://sfile.chatglm.cn/images-ppt/247053f71e4e.jpg",
  "cmqvr84rc000zpauzv13u0nyz": "https://sfile.chatglm.cn/images-ppt/76a6f4e170fa.png",
  "cmqvr84rd0011pauzxpeorfvb": "https://sfile.chatglm.cn/images-ppt/db74e52a0496.jpg",
  "cmqvr84re0013pauzhziax6n3": "https://sfile.chatglm.cn/images-ppt/665548a92643.jpg",
  "cmqvr84rf0015pauzyq36ci93": "https://sfile.chatglm.cn/images-ppt/cb842beb6c32.jpg",
  "cmqvr84rh0017pauz1j2pbrww": "https://sfile.chatglm.cn/images-ppt/fc8a5ac2c178.png",
  "cmqvr84ri0019pauzx2nzu6th": "https://sfile.chatglm.cn/images-ppt/616bd884a77f.jpg",
  "cmqvr84rj001bpauz5d3aqe3q": "https://sfile.chatglm.cn/images-ppt/432dc621dcea.jpg",
  "cmqvr84rk001dpauzb2d1d7jf": "https://sfile.chatglm.cn/images-ppt/d868b5c1b38d.png",
  "cmqvr84rk001fpauzr5zjy1k0": "https://sfile.chatglm.cn/images-ppt/37809d696099.jpg",
};

async function updateImages() {
  const entries = Object.entries(images);
  for (const [id, url] of entries) {
    try {
      await prisma.product.update({ where: { id }, data: { image: url } });
      console.log(`Updated: ${id}`);
    } catch (e: any) {
      console.error(`Failed ${id}: ${e.message}`);
    }
  }
  console.log(`\nDone! ${entries.length} products updated.`);
  await prisma.$disconnect();
}

updateImages();
