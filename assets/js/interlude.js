document.addEventListener('DOMContentLoaded', async (e) => {
  const board = document.querySelector("#social");
  const ctx = board.getContext("2d");
  const bg = new Image();
  bg.src = "/asia-2020/assets/images/bg/interlude.jpg";

  await loadImage(bg);
  ctx.drawImage(bg, 0, 0);
  
  const id = url('?id');
  const person = new Image();
  person.src = `/asia-2020/assets/images/speakers/${id}.jpg`;
  await loadImage(person);
  ctx.save();
  const width = 1920;
  const height = 1080;
  ctx.beginPath();
  const size = 400;
  ctx.scale(1, 1);
  const circle = size/2;
  ctx.arc(width / 2, height / 2, circle, 0, Math.PI*2, false);
  ctx.clip();
  ctx.drawImage(person, 0, 0, size, size, width / 2 - size / 2, height / 2 - size / 2, size, size);
  ctx.closePath();
  ctx.restore();
  ctx.beginPath();
  ctx.fillStyle = "rgb(100,100,102)";
  ctx.fillRect(560, 650, 800, 150);
  ctx.closePath();

  ctx.font = "42px  YU Gothic UI";
  ctx.fillStyle = "rgb(255,255,255)";
  let text = url('?name');
  let textWidth = ctx.measureText( text ).width;
  ctx.fillText(text, width / 2 - textWidth / 2, 710);

  ctx.font = "42px  YU Gothic UI";
  ctx.fillStyle = "rgb(255,255,255)";
  text = url('?company');
  textWidth = ctx.measureText( text ).width;
  ctx.fillText(text, width / 2 - textWidth / 2, 770);

  ctx.font = "bold 42px YU Gothic UI";
  ctx.fillStyle = "rgb(100,100,102)";
  text = `${url('?time')} UTC / ${url('?track')} Track`;
  ctx.fillText(text, width / 2 - 100, 910);

  ctx.font = "bold 42px YU Gothic UI";
  ctx.fillStyle = "rgb(100,100,102)";
  text = url('?title');
  textWidth = ctx.measureText( text ).width;
  ctx.fillText(text, width / 2 - textWidth / 2, 1000);

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
