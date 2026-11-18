export const englishTerms = {
  场景: 'Activity', 曲风: 'Genre', 心情: 'Mood',
  驾车: 'Driving', 咖啡馆: 'Café', 专注: 'Focus', 运动: 'Workout', 夜晚: 'Night', 日常: 'Everyday',
  粤语: 'Cantonese', 日系: 'Japanese', 电子: 'Electronic', 爵士: 'Jazz', 独立: 'Indie', 说唱: 'Rap',
  放松: 'Relax', 心动: 'Crush', 明亮: 'Upbeat', 史诗: 'Epic',
  开车与旅行: 'Driving & travel', 放松与情绪: 'Moods & downtime', 风格选集: 'Genre collections',
  华语与粤语: 'Mandarin & Cantonese', 日韩: 'Japan & Korea', 歌手与影视游戏: 'Artists & soundtracks',
  日常与运动: 'Everyday & workouts', 收藏与发现: 'Favorites & discoveries', 年代与节日: 'Decades & holidays',
};
const number = n => n.toLocaleString('en-US');
const tracks = n => `${number(n)} ${n === 1 ? 'track' : 'tracks'}`;
const playlists = n => `${number(n)} ${n === 1 ? 'playlist' : 'playlists'}`;

export const shelfCopy = {
  en: {
    title: 'Playlists', intro: 'Pick a sleeve to see what’s on it.',
    all: 'All playlists', more: 'More filters', filters: 'Playlist filters', clear: 'Clear filter',
    search: 'Find a playlist, song or artist', draw: 'Pick one for me',
    empty: 'No playlists match your search.', reset: 'Show all playlists',
    totals: (n, m) => `${playlists(n)} · ${tracks(m)}`,
    tracks, playlists, term: key => englishTerms[key] || key,
    open: (name, n) => `Open ${name}, ${tracks(n)}`,
    trackList: (n, complete) => n ? (complete ? `All ${tracks(n)}` : `${tracks(n)} on this shelf`) : 'Track selection in progress',
    trackLink: (name, search) => search ? `Search Apple Music for ${name}` : `Listen to ${name} on Apple Music`,
    searchTrack: 'Search', listen: 'Open a song in Apple Music',
    whole: (total, shown) => `Showing ${number(shown)} of ${tracks(total)}.`,
    cover: name => `Cover of ${name}`, download: 'Download cover', quality: 'High-res JPG', suffix: 'cover',
    dialog: 'Playlist tracks', close: 'Close playlist', wall: 'All records',
    like: (liked, song, name, n) => `${liked ? 'Unlike' : 'Like'} ${song ? 'song' : 'playlist'} ${name}, ${n} ${n === 1 ? 'like' : 'likes'}`,
    storage: 'Allow browser storage to save your likes.', error: 'Couldn’t confirm your likes.', retry: 'Retry',
  },
  zh: {
    title: '歌单', intro: '抽一张唱片，听听里面的歌。',
    all: '全部歌单', more: '更多分类', filters: '歌单分类', clear: '清除筛选',
    search: '找歌单、歌曲或歌手', draw: '替我抽一张',
    empty: '没有找到匹配的歌单。', reset: '查看全部歌单',
    totals: (n, m) => `${n} 张歌单 · ${m} 首选曲`,
    tracks: n => `${n} 首`, playlists: n => `${n} 张`, term: key => key,
    open: (name, n) => `抽出《${name}》，查看 ${n} 首选曲`,
    trackList: (n, complete) => n ? (complete ? `全部 ${n} 首` : `这里有 ${n} 首`) : '选曲还在整理中',
    trackLink: (name, search) => `在 Apple Music ${search ? '搜索' : '听'}《${name}》`,
    searchTrack: '搜索', listen: '点歌名，在 Apple Music 里听',
    whole: (total, shown) => `这张歌单有 ${total} 首，这里展示 ${shown} 首。`,
    cover: name => `《${name}》的唱片封面`, download: '下载封面', quality: '高清 JPG', suffix: '封面',
    dialog: '唱片选曲', close: '放回唱片，关闭选曲', wall: '全部唱片',
    like: (liked, song, name, n) => `${liked ? '取消点赞' : '点赞'}${song ? '歌曲' : '歌单'}《${name}》，${n} 人喜欢`,
    storage: '需要允许浏览器保存数据，才能记住你的点赞。', error: '暂时无法确认点赞状态。', retry: '重试',
  },
};
