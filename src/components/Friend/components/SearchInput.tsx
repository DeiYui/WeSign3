import User from "@/model/User";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Input, List, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

const { Search } = Input;

const CustomSearch = styled(Search)`
  .ant-input {
    height: 40px;
    width: 300px;
    border-radius: 12px;
    border: 2px solid #cccc;
  }
  &.ant-input-search .ant-input-search-button {
    height: 40px;
  }
`;

const SearchInput = () => {
  const [results, setResults] = useState<FriendProps[]>([]);
  const router = useRouter();
  const [params, setParams] = useState<{
    text: string;
    page: number;
    size: number;
  }>({
    text: "",
    page: 1,
    size: 5,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  //* API tìm kiếm bạn bè
  const { data: lstFriendSearch, isFetching } = useQuery({
    queryKey: ["searchFriend", params],
    queryFn: async () => {
      const res = await User.searchFriend(params);
      setResults(res.data.data);
      setTotalElements(res.data.totalElements);
      return res;
    },
    enabled: !!params.text,
  });
  console.log("lstFriendSearch", lstFriendSearch);

  const onSearch = (value: string) => {
    console.log("value", value);

    setResults([]);
  };

  const onItemClick = (id: number) => {
    router.push(`/friend/${id}`);
  };

  const onLoadMore = () => {
    setParams({ ...params, size: params.size + 5 });
  };

  const loadMore =
    !isFetching && totalElements > results?.length ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>Xem thêm</Button>
      </div>
    ) : null;

  return (
    <div className="relative ">
      <CustomSearch
        placeholder="Tìm kiếm bạn bè"
        onSearch={onSearch}
        onChange={(e) =>
          setParams({ ...params, text: e.target.value, size: 5 })
        }
        enterButton
      />
      {params.text && (
        <div className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg">
          <List
            className="custom-scrollbar max-h-[350px] overflow-y-auto  pb-4"
            loading={isFetching}
            itemLayout="horizontal"
            dataSource={results}
            loadMore={loadMore}
            bordered
            renderItem={(friend) => (
              <List.Item className="hover:cursor-pointer hover:bg-neutral-300">
                <Skeleton avatar title={false} loading={isFetching} active>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        className="mt-1"
                        size={40}
                        icon={<UserOutlined />}
                        src={friend.avatarLocation}
                      />
                    }
                    title={<div className="font-semibold">{friend.name}</div>}
                    description={friend.email}
                  />
                </Skeleton>
              </List.Item>
            )}
            locale={{ emptyText: "Không có kết quả tìm kiếm" }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
