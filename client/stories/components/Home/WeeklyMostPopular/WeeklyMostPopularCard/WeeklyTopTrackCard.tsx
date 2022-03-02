import Link from "next/link";
import Image from "next/image";
import React from "react";
import { IWeeklyTopTrack } from "../../../../../interfaces/IWeeklyTopTrack";
import { Card, Group, Badge, Text } from "@mantine/core";

interface WeeklyTopTrackCardProps {
  card: IWeeklyTopTrack;
}

export const WeeklyTopTrackCard: React.FC<WeeklyTopTrackCardProps> = ({
  card,
}) => {
  return (
    <article className="flex flex-col rounded-lg cursor-pointer pb-1">
      <div className="flexjustify-center overflow-hidden relative">
        <img
          src={card.image}
          alt="Product Image"
          className="w-full  h-auto object-cover object-center "
          height={278}
          width={278}
        />
      </div>

      <Group
        position="apart"
        style={{ marginBottom: 5, marginTop: 10 }}
        className="ml-1"
      >
        <Text weight={700}>{card.trackTitle}</Text>
        <Badge color="orange" variant="light">
          Hot Track
        </Badge>
      </Group>
      <Text
        className="ml-1"
        size="sm"
        style={{ lineHeight: 1.5 }}
      >
        {card.artist}
      </Text>
    </article>
  );
};
