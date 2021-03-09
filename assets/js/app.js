document.addEventListener('DOMContentLoaded', async (e) => {
  const board = document.querySelector("#social");
  const ctx = board.getContext("2d");
  const bg = new Image();
  bg.src = "/asia-2020/assets/images/socials/base.jpg";

  await loadImage(bg);
  ctx.drawImage(bg, 0, 0);
  
  const id = url('?id');
  const person = new Image();
  person.src = `/asia-2020/assets/images/speakers/${id}.jpg`;
  await loadImage(person);
  ctx.save();
  const width = 1200;
  const height = 630;
  ctx.beginPath();
  const size = 347;
  ctx.scale(0.86, 0.86);
  const circle = size/2;
  ctx.arc(600 + size/3, 380, circle, 0, Math.PI*2, false);
  ctx.clip();
  ctx.drawImage(person, 0, 0, size, size, width / 2 - 58, height / 2 - 110, size, size);
  ctx.closePath();
  ctx.restore();
  ctx.beginPath();
  ctx.fillStyle = "rgb(100,100,102)";
  ctx.fillRect(319, 460, 563, 77);
  ctx.closePath();

  ctx.font = "42px Arial";
  ctx.fillStyle = "rgb(255,255,255)";
  const text = url('?name');
  const textWidth = ctx.measureText( text ).width;
  ctx.fillText(text, 319 + (563 - textWidth) / 2, 510);

  const link = document.createElement("a");
  link.href = board.toDataURL("image/jpeg");
  link.download = `${id}.jpg`;
  link.click();
});

async function loadImage(image) {
  return new Promise((res, rej) => {
    image.onload = res;
  })
}
