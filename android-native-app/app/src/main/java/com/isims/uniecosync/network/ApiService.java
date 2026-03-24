package com.isims.uniecosync.network;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public interface ApiService {

    @Multipart
    @POST("/api/report/issues/analyze")
    Call<IssueResponse> reportIssue(
        @Part MultipartBody.Part image,
        @Part("description") RequestBody description,
        @Part("student_id") RequestBody studentId
    );
}
