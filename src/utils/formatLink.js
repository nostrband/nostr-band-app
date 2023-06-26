export const strWithLinks = (str) => {
  const urlRegex =
    /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
  return str.split(urlRegex).map((a, index) => {
    if (a.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          target="_blank"
          rel="noopener noreferrer nofollow"
          href={a}
        >
          {a}
        </a>
      );
    }
    return a;
  });
};

export const defineTypeLink = (link) => {
  const u = link.split("?")[0].toLowerCase();
  if (u.endsWith(".mov") || u.endsWith(".mp4")) {
    return {
      type: "MovieType",
      content: <video class="play" src={u} controls preload="metadata"></video>,
    };
  } else if (u.includes("youtube.com/") || u.includes("youtu.be/")) {
    const ur = u.replace("watch", "embed/");
    return {
      type: "MovieType",
      content: (
        <iframe
          title="youtube"
          id="ytplayer"
          class="youtube-fram"
          type="text/html"
          width="640"
          height="360"
          src={ur}
          frameborder="0"
        ></iframe>
      ),
    };
  } else if (u.endsWith(".mp3") || u.endsWith(".ogg")) {
    return {
      type: "AudioType",
      content: (
        <audio class="audio-content" src={u} controls preload="metadata" />
      ),
    };
  } else if (
    u.endsWith(".webp") ||
    u.endsWith(".jpg") ||
    u.endsWith(".jpeg") ||
    u.endsWith(".gif") ||
    u.endsWith(".png")
  ) {
    return {
      type: "PictureType",
      content: (
        <img alt="content" width="100%" className="content-image" src={u} />
      ),
    };
  }
};
