'use client'

import { useEffect, useState } from "react";
import { useMemberContext } from "../../context/member-context";
import { useParams } from "next/navigation";

function MemberProfile({ member }) {
    return (
        <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
            <div className="w-40 h-40 rounded-full inline-flex items-center justify-center bg-gray-200">
                <img
                    src={member.imageUrl || member.iconUrl}
                    alt={`${member.memberName}의 이미지`}
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div className="flex flex-col items-center text-center justify-center">
                <h2 className="font-medium title-font mt-4 text-gray-900 text-lg">{member.realName} {member.memberName}</h2>
                <div className="w-20 h-1 bg-yellow-500 rounded mt-2 mb-4"></div>
                <p className="text-gray-900">{member.goal}</p>
                <p className="text-gray-900">{member.position}</p>
                <p className="text-gray-900">{member.firstDate}부터</p>
                <p className="text-gray-900">총 {Math.floor(member.totalTime)}시간</p>
            </div>
        </div>
    );
}

function MemberLinks({ member }) {
    return (
        <>
            <h2 className="text-xl font-semibold mt-4">{member.realName}</h2>
            <p className="text-gray-900">{member.introduction}</p>
            {member.portfolio && (
                <>
                    <h2 className="text-xl font-semibold mt-4">포폴</h2>
                    <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {member.portfolio}
                    </a>
                </>
            )}
            {member.blog && (
                <>
                    <h2 className="text-xl font-semibold mt-4">블로그</h2>
                    <a
                        href={member.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {member.blog}
                    </a>
                </>
            )}
            {member.gitHub && (
                <>
                    <h2 className="text-xl font-semibold mt-4">깃헙</h2>
                    <a
                        href={member.gitHub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {member.gitHub}
                    </a>
                </>
            )}
        </>
    );
}

export default function MemberPage() {
    const { id } = useParams();
    const { memberData } = useMemberContext();
    const [member, setMember] = useState(null);

    useEffect(() => {
        if (memberData && id) {
            const foundMember = memberData.find(member => member.memberId === id);
            setMember(foundMember);
        }
    }, [id, memberData]);

    if (!member) {
        return <div>Loading...</div>;
    }

    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto flex flex-col">
                <div className="lg:w-4/6 mx-auto">
                    <div className="flex flex-col sm:flex-row mt-10">
                        <MemberProfile member={member} />
                        <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                            <MemberLinks member={member} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
