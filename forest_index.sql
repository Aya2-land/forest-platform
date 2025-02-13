-- テーブルのインデックス `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `map_acti_id` (`map_id`),
  ADD KEY `nodever_acti_bef_id` (`before_node_version`),
  ADD KEY `nodever_acti_aft_id` (`after_node_version`);

--
-- テーブルのインデックス `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`chapter_id`),
  ADD KEY `map_cha_id` (`map_id`);

--
-- テーブルのインデックス `chapter_histories`
--
ALTER TABLE `chapter_histories`
  ADD PRIMARY KEY (`chapter_history_id`),
  ADD KEY `chaver_chahis_id` (`chapter_version_id`),
  ADD KEY `cha_chahis_bro_id` (`chapter_bro_id`);

--
-- テーブルのインデックス `chapter_versions`
--
ALTER TABLE `chapter_versions`
  ADD PRIMARY KEY (`chapter_version_id`),
  ADD KEY `cha_chaver_id` (`chapter_id`),
  ADD KEY `mapver_chaver_id` (`map_version_id`),
  ADD KEY `cha_chaver_bro_id` (`chapter_bro_id`);

--
-- テーブルのインデックス `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`);

--
-- テーブルのインデックス `comment_annotations`
--
ALTER TABLE `comment_annotations`
  ADD PRIMARY KEY (`annotation_id`),
  ADD KEY `com_anncom_id` (`comment_id`);

--
-- テーブルのインデックス `comment_destinations`
--
ALTER TABLE `comment_destinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `com_comdes_id` (`comment_id`);

--
-- テーブルのインデックス `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `nodehis_feed_id` (`node_history_id`);

--
-- テーブルのインデックス `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`image_id`);

--
-- テーブルのインデックス `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `item_map_id` (`map_id`);

--
-- テーブルのインデックス `item_contents`
--
ALTER TABLE `item_contents`
  ADD PRIMARY KEY (`item_content_id`),
  ADD KEY `item_itcon_id` (`item_id`);

--
-- テーブルのインデックス `item_content_histories`
--
ALTER TABLE `item_content_histories`
  ADD PRIMARY KEY (`item_content_history_id`),
  ADD KEY `itconver_itconhis_id` (`item_content_version_id`);

--
-- テーブルのインデックス `item_content_versions`
--
ALTER TABLE `item_content_versions`
  ADD PRIMARY KEY (`item_content_version_id`),
  ADD KEY `node_itcon_id` (`node_id`) USING BTREE,
  ADD KEY `type_itcon_id` (`type_id`),
  ADD KEY `itver_itcon_id` (`item_content_id`);

--
-- テーブルのインデックス `item_histories`
--
ALTER TABLE `item_histories`
  ADD PRIMARY KEY (`item_history_id`),
  ADD KEY `iver_ithis_id` (`item_version_id`),
  ADD KEY `node_ithis_id` (`node_id`),
  ADD KEY `type_ithis_id` (`type_id`);

--
-- テーブルのインデックス `item_versions`
--
ALTER TABLE `item_versions`
  ADD PRIMARY KEY (`item_version_id`),
  ADD KEY `item_itver_id` (`item_id`),
  ADD KEY `node_itver_id` (`node_id`),
  ADD KEY `type_itver_id` (`type_id`);

--
-- テーブルのインデックス `maps`
--
ALTER TABLE `maps`
  ADD PRIMARY KEY (`map_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pap_map_id` (`paper_id`);

--
-- テーブルのインデックス `map_mode_links`
--
ALTER TABLE `map_mode_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mode_maplimo_id` (`mode_id`),
  ADD KEY `map_maplimo_id` (`map_id`);

--
-- テーブルのインデックス `map_node_links`
--
ALTER TABLE `map_node_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `map_version_id` (`map_version_id`),
  ADD UNIQUE KEY `node_version_id` (`node_version_id`);

--
-- テーブルのインデックス `map_versions`
--
ALTER TABLE `map_versions`
  ADD PRIMARY KEY (`map_version_id`),
  ADD UNIQUE KEY `map_id` (`map_id`);

--
-- テーブルのインデックス `map_version_reasons`
--
ALTER TABLE `map_version_reasons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `map_version_id` (`map_version_id`);

--
-- テーブルのインデックス `modes`
--
ALTER TABLE `modes`
  ADD PRIMARY KEY (`mode_id`);

--
-- テーブルのインデックス `mt_timing`
--
ALTER TABLE `mt_timing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_mtt_id` (`user_id`);

--
-- テーブルのインデックス `network_edges`
--
ALTER TABLE `network_edges`
  ADD PRIMARY KEY (`edge_id`),
  ADD KEY `netno_netedst_id` (`edge_start`),
  ADD KEY `netno_neteden_id` (`edge_end`);

--
-- テーブルのインデックス `network_maps`
--
ALTER TABLE `network_maps`
  ADD PRIMARY KEY (`network_map_id`),
  ADD KEY `map_netmap_id` (`map_id`);

--
-- テーブルのインデックス `network_mindmap_connects`
--
ALTER TABLE `network_mindmap_connects`
  ADD PRIMARY KEY (`network_node_id`),
  ADD KEY `node_netnode_id` (`mindmap_node_id`);

--
-- テーブルのインデックス `network_nodes`
--
ALTER TABLE `network_nodes`
  ADD PRIMARY KEY (`network_node_id`),
  ADD KEY `netmap_netno_id` (`network_map_id`);

--
-- テーブルのインデックス `network_ontology_connects`
--
ALTER TABLE `network_ontology_connects`
  ADD PRIMARY KEY (`network_node_id`);

--
-- テーブルのインデックス `network_recruit`
--
ALTER TABLE `network_recruit`
  ADD PRIMARY KEY (`network_node_id`);

--
-- テーブルのインデックス `network_texts`
--
ALTER TABLE `network_texts`
  ADD PRIMARY KEY (`network_text_id`),
  ADD KEY `netmap_nettex_id` (`network_map_id`);

--
-- テーブルのインデックス `nodes`
--
ALTER TABLE `nodes`
  ADD PRIMARY KEY (`node_id`),
  ADD KEY `node_user_id` (`user_id`),
  ADD KEY `type_node_id` (`type_id`);

--
-- テーブルのインデックス `node_actions`
--
ALTER TABLE `node_actions`
  ADD PRIMARY KEY (`node_action_id`),
  ADD KEY `nhis_nact_id` (`node_history_id`);

--
-- テーブルのインデックス `node_histories`
--
ALTER TABLE `node_histories`
  ADD PRIMARY KEY (`node_history_id`),
  ADD KEY `nhis_type_id` (`type_id`),
  ADD KEY `nver_nhis_id` (`node_version_id`);

--
-- テーブルのインデックス `node_versions`
--
ALTER TABLE `node_versions`
  ADD PRIMARY KEY (`node_version_id`),
  ADD KEY `type_nver_id` (`type_id`),
  ADD KEY `node_nver_id` (`node_id`);

--
-- テーブルのインデックス `papers`
--
ALTER TABLE `papers`
  ADD PRIMARY KEY (`id`);

--
-- テーブルのインデックス `paper_annotations`
--
ALTER TABLE `paper_annotations`
  ADD PRIMARY KEY (`annotation_id`),
  ADD KEY `node_annnode_id` (`node_id`);

--
-- テーブルのインデックス `paragraphes`
--
ALTER TABLE `paragraphes`
  ADD PRIMARY KEY (`paragraph_id`),
  ADD KEY `sec_par_id` (`section_id`);

--
-- テーブルのインデックス `paragraph_contents`
--
ALTER TABLE `paragraph_contents`
  ADD PRIMARY KEY (`paragraph_content_id`),
  ADD KEY `par_parcon_id` (`paragraph_id`);

--
-- テーブルのインデックス `paragraph_content_histories`
--
ALTER TABLE `paragraph_content_histories`
  ADD PRIMARY KEY (`paragraph_content_history_id`),
  ADD KEY `type_parconhis_id` (`type_id`),
  ADD KEY `parcon_parconhis_bro_id` (`paragraph_content_bro_id`),
  ADD KEY `parcon_parconhis_par_id` (`paragraph_content_par_id`),
  ADD KEY `parconver_parconhis_id` (`paragraph_content_version_id`);

--
-- テーブルのインデックス `paragraph_content_versions`
--
ALTER TABLE `paragraph_content_versions`
  ADD PRIMARY KEY (`paragraph_content_version_id`),
  ADD KEY `parver_parconver_id` (`paragraph_version_id`),
  ADD KEY `parcon_parconver_id` (`paragraph_content_id`),
  ADD KEY `type_parconver_id` (`type_id`),
  ADD KEY `parcon_parconver_par_id` (`paragraph_content_par_id`),
  ADD KEY `parcon_parconver_bro_id` (`paragraph_content_bro_id`);

--
-- テーブルのインデックス `paragraph_histories`
--
ALTER TABLE `paragraph_histories`
  ADD PRIMARY KEY (`paragraph_history_id`),
  ADD KEY `parver_parhis_id` (`paragraph_version_id`),
  ADD KEY `par_parhis_bro_id` (`paragraph_bro_id`);

--
-- テーブルのインデックス `paragraph_versions`
--
ALTER TABLE `paragraph_versions`
  ADD PRIMARY KEY (`paragraph_version_id`),
  ADD KEY `par_parver_id` (`paragraph_id`),
  ADD KEY `secver_parver_id` (`section_version_id`),
  ADD KEY `par_parver_bro_id` (`paragraph_bro_id`);

--
-- テーブルのインデックス `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `cha_sec_id` (`chapter_id`);

--
-- テーブルのインデックス `section_histories`
--
ALTER TABLE `section_histories`
  ADD PRIMARY KEY (`section_history_id`),
  ADD KEY `secver_sechis_id` (`section_version_id`),
  ADD KEY `sec_sechis_bro_id` (`section_bro_id`);

--
-- テーブルのインデックス `section_versions`
--
ALTER TABLE `section_versions`
  ADD PRIMARY KEY (`section_version_id`),
  ADD KEY `sec_secver_id` (`section_id`),
  ADD KEY `chaver_secver_id` (`chapter_version_id`),
  ADD KEY `sec_secver_bro_id` (`section_bro_id`);

--
-- テーブルのインデックス `types`
--
ALTER TABLE `types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type` (`type`);

--
-- テーブルのインデックス `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- ダンプしたテーブルの制約
--

--
-- テーブルの制約 `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `map_acti_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`),
  ADD CONSTRAINT `nodever_acti_aft_id` FOREIGN KEY (`after_node_version`) REFERENCES `node_versions` (`node_version_id`),
  ADD CONSTRAINT `nodever_acti_bef_id` FOREIGN KEY (`before_node_version`) REFERENCES `node_versions` (`node_version_id`);

--
-- テーブルの制約 `chapters`
--
ALTER TABLE `chapters`
  ADD CONSTRAINT `map_cha_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`);

--
-- テーブルの制約 `chapter_histories`
--
ALTER TABLE `chapter_histories`
  ADD CONSTRAINT `cha_chahis_bro_id` FOREIGN KEY (`chapter_bro_id`) REFERENCES `chapters` (`chapter_id`),
  ADD CONSTRAINT `chaver_chahis_id` FOREIGN KEY (`chapter_version_id`) REFERENCES `chapter_versions` (`chapter_version_id`);

--
-- テーブルの制約 `chapter_versions`
--
ALTER TABLE `chapter_versions`
  ADD CONSTRAINT `cha_chaver_bro_id` FOREIGN KEY (`chapter_bro_id`) REFERENCES `chapters` (`chapter_id`),
  ADD CONSTRAINT `cha_chaver_id` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`chapter_id`),
  ADD CONSTRAINT `mapver_chaver_id` FOREIGN KEY (`map_version_id`) REFERENCES `map_versions` (`map_version_id`);

--
-- テーブルの制約 `comment_annotations`
--
ALTER TABLE `comment_annotations`
  ADD CONSTRAINT `com_anncom_id` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`comment_id`);

--
-- テーブルの制約 `comment_destinations`
--
ALTER TABLE `comment_destinations`
  ADD CONSTRAINT `com_comdes_id` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`comment_id`);

--
-- テーブルの制約 `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `nodehis_feed_id` FOREIGN KEY (`node_history_id`) REFERENCES `node_histories` (`node_history_id`);

--
-- テーブルの制約 `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `item_map_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`);

--
-- テーブルの制約 `item_contents`
--
ALTER TABLE `item_contents`
  ADD CONSTRAINT `item_itcon_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`);

--
-- テーブルの制約 `item_content_histories`
--
ALTER TABLE `item_content_histories`
  ADD CONSTRAINT `itconver_itconhis_id` FOREIGN KEY (`item_content_version_id`) REFERENCES `item_content_versions` (`item_content_version_id`);

--
-- テーブルの制約 `item_content_versions`
--
ALTER TABLE `item_content_versions`
  ADD CONSTRAINT `itver_itcon_id` FOREIGN KEY (`item_content_id`) REFERENCES `item_contents` (`item_content_id`),
  ADD CONSTRAINT `node_itcon_id	` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`),
  ADD CONSTRAINT `type_itcon_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `item_histories`
--
ALTER TABLE `item_histories`
  ADD CONSTRAINT `iver_ithis_id` FOREIGN KEY (`item_version_id`) REFERENCES `item_versions` (`item_version_id`),
  ADD CONSTRAINT `node_ithis_id` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`),
  ADD CONSTRAINT `type_ithis_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `item_versions`
--
ALTER TABLE `item_versions`
  ADD CONSTRAINT `item_itver_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`),
  ADD CONSTRAINT `node_itver_id` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`),
  ADD CONSTRAINT `type_itver_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `maps`
--
ALTER TABLE `maps`
  ADD CONSTRAINT `maps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `pap_map_id` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`id`);

--
-- テーブルの制約 `map_mode_links`
--
ALTER TABLE `map_mode_links`
  ADD CONSTRAINT `map_maplimo_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`),
  ADD CONSTRAINT `mode_maplimo_id` FOREIGN KEY (`mode_id`) REFERENCES `modes` (`mode_id`);

--
-- テーブルの制約 `map_node_links`
--
ALTER TABLE `map_node_links`
  ADD CONSTRAINT `mver_mver_id` FOREIGN KEY (`map_version_id`) REFERENCES `map_versions` (`map_version_id`),
  ADD CONSTRAINT `mver_nver_id` FOREIGN KEY (`node_version_id`) REFERENCES `node_versions` (`node_version_id`);

--
-- テーブルの制約 `map_versions`
--
ALTER TABLE `map_versions`
  ADD CONSTRAINT `map_ver_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`);

--
-- テーブルの制約 `map_version_reasons`
--
ALTER TABLE `map_version_reasons`
  ADD CONSTRAINT `ver_reason` FOREIGN KEY (`map_version_id`) REFERENCES `map_versions` (`map_version_id`);

--
-- テーブルの制約 `mt_timing`
--
ALTER TABLE `mt_timing`
  ADD CONSTRAINT `user_mtt_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- テーブルの制約 `network_edges`
--
ALTER TABLE `network_edges`
  ADD CONSTRAINT `netno_neteden_id` FOREIGN KEY (`edge_end`) REFERENCES `network_nodes` (`network_node_id`),
  ADD CONSTRAINT `netno_netedst_id` FOREIGN KEY (`edge_start`) REFERENCES `network_nodes` (`network_node_id`);

--
-- テーブルの制約 `network_maps`
--
ALTER TABLE `network_maps`
  ADD CONSTRAINT `map_netmap_id` FOREIGN KEY (`map_id`) REFERENCES `maps` (`map_id`);

--
-- テーブルの制約 `network_mindmap_connects`
--
ALTER TABLE `network_mindmap_connects`
  ADD CONSTRAINT `netno_netno_id` FOREIGN KEY (`network_node_id`) REFERENCES `network_nodes` (`network_node_id`),
  ADD CONSTRAINT `node_netnode_id` FOREIGN KEY (`mindmap_node_id`) REFERENCES `nodes` (`node_id`);

--
-- テーブルの制約 `network_nodes`
--
ALTER TABLE `network_nodes`
  ADD CONSTRAINT `netmap_netno_id` FOREIGN KEY (`network_map_id`) REFERENCES `network_maps` (`network_map_id`);

--
-- テーブルの制約 `network_ontology_connects`
--
ALTER TABLE `network_ontology_connects`
  ADD CONSTRAINT `netnode_netont_id` FOREIGN KEY (`network_node_id`) REFERENCES `network_nodes` (`network_node_id`);

--
-- テーブルの制約 `network_recruit`
--
ALTER TABLE `network_recruit`
  ADD CONSTRAINT `netnode_netrec_id` FOREIGN KEY (`network_node_id`) REFERENCES `network_nodes` (`network_node_id`);

--
-- テーブルの制約 `network_texts`
--
ALTER TABLE `network_texts`
  ADD CONSTRAINT `netmap_nettex_id` FOREIGN KEY (`network_map_id`) REFERENCES `network_maps` (`network_map_id`);

--
-- テーブルの制約 `nodes`
--
ALTER TABLE `nodes`
  ADD CONSTRAINT `node_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `type_node_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `node_actions`
--
ALTER TABLE `node_actions`
  ADD CONSTRAINT `nhis_nact_id` FOREIGN KEY (`node_history_id`) REFERENCES `node_histories` (`node_history_id`);

--
-- テーブルの制約 `node_histories`
--
ALTER TABLE `node_histories`
  ADD CONSTRAINT `nhis_type_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`),
  ADD CONSTRAINT `nver_nhis_id` FOREIGN KEY (`node_version_id`) REFERENCES `node_versions` (`node_version_id`);

--
-- テーブルの制約 `node_versions`
--
ALTER TABLE `node_versions`
  ADD CONSTRAINT `node_nver_id` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`),
  ADD CONSTRAINT `type_nver_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `paper_annotations`
--
ALTER TABLE `paper_annotations`
  ADD CONSTRAINT `node_annnode_id` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`);

--
-- テーブルの制約 `paragraphes`
--
ALTER TABLE `paragraphes`
  ADD CONSTRAINT `sec_par_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`);

--
-- テーブルの制約 `paragraph_contents`
--
ALTER TABLE `paragraph_contents`
  ADD CONSTRAINT `par_parcon_id` FOREIGN KEY (`paragraph_id`) REFERENCES `paragraphes` (`paragraph_id`);

--
-- テーブルの制約 `paragraph_content_histories`
--
ALTER TABLE `paragraph_content_histories`
  ADD CONSTRAINT `parcon_parconhis_bro_id` FOREIGN KEY (`paragraph_content_bro_id`) REFERENCES `paragraph_contents` (`paragraph_content_id`),
  ADD CONSTRAINT `parcon_parconhis_par_id` FOREIGN KEY (`paragraph_content_par_id`) REFERENCES `paragraph_contents` (`paragraph_content_id`),
  ADD CONSTRAINT `parconver_parconhis_id` FOREIGN KEY (`paragraph_content_version_id`) REFERENCES `paragraph_content_versions` (`paragraph_content_version_id`),
  ADD CONSTRAINT `type_parconhis_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `paragraph_content_versions`
--
ALTER TABLE `paragraph_content_versions`
  ADD CONSTRAINT `parcon_parconver_bro_id` FOREIGN KEY (`paragraph_content_bro_id`) REFERENCES `paragraph_contents` (`paragraph_content_id`),
  ADD CONSTRAINT `parcon_parconver_id` FOREIGN KEY (`paragraph_content_id`) REFERENCES `paragraph_contents` (`paragraph_content_id`),
  ADD CONSTRAINT `parcon_parconver_par_id` FOREIGN KEY (`paragraph_content_par_id`) REFERENCES `paragraph_contents` (`paragraph_content_id`),
  ADD CONSTRAINT `parver_parconver_id` FOREIGN KEY (`paragraph_version_id`) REFERENCES `paragraph_versions` (`paragraph_version_id`),
  ADD CONSTRAINT `type_parconver_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`);

--
-- テーブルの制約 `paragraph_histories`
--
ALTER TABLE `paragraph_histories`
  ADD CONSTRAINT `par_parhis_bro_id` FOREIGN KEY (`paragraph_bro_id`) REFERENCES `paragraphes` (`paragraph_id`),
  ADD CONSTRAINT `parver_parhis_id` FOREIGN KEY (`paragraph_version_id`) REFERENCES `paragraph_versions` (`paragraph_version_id`);

--
-- テーブルの制約 `paragraph_versions`
--
ALTER TABLE `paragraph_versions`
  ADD CONSTRAINT `par_parver_bro_id` FOREIGN KEY (`paragraph_bro_id`) REFERENCES `paragraphes` (`paragraph_id`),
  ADD CONSTRAINT `par_parver_id` FOREIGN KEY (`paragraph_id`) REFERENCES `paragraphes` (`paragraph_id`),
  ADD CONSTRAINT `secver_parver_id` FOREIGN KEY (`section_version_id`) REFERENCES `section_versions` (`section_version_id`);

--
-- テーブルの制約 `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `cha_sec_id` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`chapter_id`);

--
-- テーブルの制約 `section_histories`
--
ALTER TABLE `section_histories`
  ADD CONSTRAINT `sec_sechis_bro_id` FOREIGN KEY (`section_bro_id`) REFERENCES `sections` (`section_id`),
  ADD CONSTRAINT `secver_sechis_id` FOREIGN KEY (`section_version_id`) REFERENCES `section_versions` (`section_version_id`);

--
-- テーブルの制約 `section_versions`
--
ALTER TABLE `section_versions`
  ADD CONSTRAINT `chaver_secver_id` FOREIGN KEY (`chapter_version_id`) REFERENCES `chapter_versions` (`chapter_version_id`),
  ADD CONSTRAINT `sec_secver_bro_id` FOREIGN KEY (`section_bro_id`) REFERENCES `sections` (`section_id`),
  ADD CONSTRAINT `sec_secver_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
