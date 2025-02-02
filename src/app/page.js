import Image from "next/image";
import Layout from "./components/layout";
import MainClient from "./components/main-client";

export default async function Home() {
  const { Client } = require("@notionhq/client");

  const notion = new Client({ auth: "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" });

  const memberDatabaseId = "6167860f2e3747cb98495bc70ec6563f";
  const activityDatabaseId = "2e10e0944c774ff69baebd6aadf57d21";

  const fetchMemberData = async () => {
    try {
      const response = await notion.databases.query({ database_id: memberDatabaseId });
      return response.results.map((page) => ({
        memberId: page.id,
        memberName: page.properties["이름"]?.title[0]?.text?.content || "Unknown",
        realName: page.properties["본명"]?.rich_text[0]?.text?.content || "Unknown",
        goal: page.properties["목표"]?.select?.name || "Unknown",
        position: page.properties["직책"]?.select?.name || "Unknown",
        firstDate: page.properties["첫 참여일"]?.date?.start || null,
        portfolio: page.properties["포폴"]?.url || null,
        gitHub: page.properties["깃헙"]?.url || null,
        blog: page.properties["블로그"]?.url || null,
        iconUrl: page.icon?.external?.url || null,
        imageUrl: page.properties["이미지"]?.files[0]?.file?.url || null,
        introduction: page.properties["소개"]?.rich_text[0]?.text?.content || "None",
      }));
    } catch (error) {
      console.error("Failed to fetch member data:", error);
      return [];
    }
  };

  const fetchActivityData = async () => {
    let activities = [];
    let hasMore = true;
    let nextCursor = null;

    try {
      while (hasMore) {
        const response = await notion.databases.query({
          database_id: activityDatabaseId,
          start_cursor: nextCursor || undefined,
        });

        activities = [
          ...activities,
          ...response.results.map((page) => ({
            memberId: page.properties["멤버 DB"]?.relation[0]?.id || null,
            time: page.properties["시간"]?.number || 0,
            state: page.properties["상태"]?.select?.name || "None",
            rollupDate: page.properties["날짜"]?.rollup?.array[0]?.date?.start || null,
            tags: page.properties["활동 유형"]?.multi_select.map((tag) => tag.name) || [],
          })),
        ];

        hasMore = response.has_more;
        nextCursor = response.next_cursor;
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    }

    return activities;
  };

  const processData = (members, activities) => {
    const memberMap = Object.fromEntries(members.map((m) => [m.memberId, m]));
    const activitySummary = {};

    activities.forEach(({ memberId, time, state, rollupDate, tags }) => {
      if (!rollupDate || !memberMap[memberId]) return;

      const date = new Date(rollupDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const monthKey = `${year}년 ${String(month).padStart(2, "0")}월`;

      if (!activitySummary[memberId]) {
        activitySummary[memberId] = { 
          activityByMonth: {}, 
          totalTime: 0,
          tagCounts: {},
        };
      }

      const memberActivity = activitySummary[memberId];
      if (!memberActivity.activityByMonth[monthKey]) {
        memberActivity.activityByMonth[monthKey] = {
          totalTime: 0,
          count: 0,
          stateCounts: { 좋음: 0, 보통: 0, 나쁨: 0 },
          activityByDate: {},
          tagCounts: {},
        };
      }

      const monthActivity = memberActivity.activityByMonth[monthKey];
      monthActivity.totalTime += time;
      monthActivity.count += 1;
      monthActivity.stateCounts[state] = (monthActivity.stateCounts[state] || 0) + 1;
      monthActivity.activityByDate[day] = {
        time: (monthActivity.activityByDate[day]?.time || 0) + time,
        state,
      };

      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          memberActivity.tagCounts[tag] = (memberActivity.tagCounts[tag] || 0) + 1;
          monthActivity.tagCounts[tag] = (monthActivity.tagCounts[tag] || 0) + 1;
        });

        const sortedTags = Object.entries(memberActivity.tagCounts).sort((a, b) => b[1] - a[1]);
      }

      memberActivity.totalTime += time;
    });

    return members.map((member) => ({
      ...member,
      ...activitySummary[member.memberId],
    }));
  };

  const memberData = await fetchMemberData();
  const activityData = await fetchActivityData();
  const processedData = processData(memberData, activityData);

  console.log(processedData);

  return (
    <Layout memberData={processedData}>
      <MainClient memberData={processedData} />
    </Layout>
  );
}
