const limit = 5;
const cateId = "1003834";

let notifyCount = 0;
const reqUrl = {
  url: `https://api3.vnexpress.net/api/article?type=get_article_folder&cate_id=${cateId}&limit=${limit}&offset=0&option=video_autoplay,object,get_zone&app_id=9e304d`,
};

/**
 * Main function
 */
(function () {
  $task.fetch(reqUrl).then(
    (response) => {
      const body = JSON.parse(response.body);
      for (const index in body.data[cateId]) {
        const postTime = timeConverter(body.data[cateId][index].publish_time);
        const title = body.data[cateId][index].title;
        const dataLead = body.data[cateId][index].lead;
        const newsUrl = body.data[cateId][index].share_url;
        const videoId = body.data[cateId][index].check_object.video;
        const videoLink = body.data[cateId][index].check_object.video_autoplay[videoId].size_format["240"];
        const notificationURL = { "open-url": newsUrl, "media-url": videoLink };
        if (needUpdate(newsUrl, postTime)) {
          $notify(
            "🗞VNEXPRESS.NET",
            title,
            `${dataLead}\n${postTime}`,
            notificationURL
          );
          $prefs.setValueForKey(postTime, hash(newsUrl));
          notifyCount++;
        }
      }
      if (notifyCount === 0) {
        console.log(`🔴 Không có tin mới!`);
      } else {
        console.log(`🟢 Có ${notifyCount} tin mới!\n🟡 Đang tải...`);
      }
    },
    (reason) => {
      console.error(reason);
    }
  );
  $done();
})();

/**
 * Convert UNIX timestamp to readable format
 * @returns String
 */
function timeConverter(UNIX_timestamp) {
  const inputDateTime = new Date(UNIX_timestamp * 1000);
  const year = inputDateTime.getFullYear();
  const month = inputDateTime.getMonth() + 1;
  const date = inputDateTime.getDate();
  const hour = inputDateTime.getHours();
  const min = inputDateTime.getMinutes();
  const sec = inputDateTime.getSeconds();
  return `📆${addZero(date)}/${addZero(month)}/${addZero(year)} ⌚${addZero(hour)}:${addZero(min)}:${addZero(sec)} (GMT+7)`;
}

/**
 * Add zero to datetime number
 * @returns String
 */
function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/**
 * Check if have new post
 * @returns Boolean
 */
function needUpdate(url, timestamp) {
  var storedTimestamp = $prefs.valueForKey(hash(url));
  return storedTimestamp === undefined || storedTimestamp !== timestamp
    ? true
    : false;
}

/**
 * Hashing string for storing in preferences
 * @returns String
 */
function hash(str) {
  let h = 0;
  let chr;
  for (let i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    h = (h << 5) - h + chr;
    h |= 0;
  }
  return String(h);
}
